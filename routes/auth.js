const {Router} = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto')
const {validationResult} = require('express-validator')
const User = require('../models/user');
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const keys = require('../keys/index')
const registrationEmail = require('../emails/registration')
const resetPasswordEmail = require('../emails/reset')
const {registerValidators} = require('../utils/validators')
const router = Router();

const transporter = nodemailer.createTransport(sendgrid({
    auth: {api_key: keys.SENDGRID_API_KEY}
}))


router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Login',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError'),
    });
});

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const candidate = await User.findOne({email});

        if (candidate) {
            if (await bcrypt.compare(password, candidate.password)) {
                req.session.user = candidate;
                req.session.isAuthenticated = true;
                req.session.save(err => {
                    if (err) {
                        throw err
                    }
                    res.redirect('/')
                });
            } else {
                req.flash('loginError', 'Email or password is wrong.')
                res.redirect('/auth/login#login')
            }
        } else {
            req.flash('loginError', 'Email or password is wrong.')
            res.redirect('/auth/login#login')
        }
    } catch (e) {
        console.log(e);
        req.status(500).json({errorCode: 500});
    }
});

router.get('/registration', async (req, res) => {
    res.render('auth/registration', {
        title: 'Registration',
        isLogin: true
    });
});

router.post('/registration', registerValidators, async (req, res) => {
    try {
        const {name, email, password} = req.body;

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#registration')
        }

        const candidate = await User.findOne({email: email});

        if (candidate) {
            req.flash('registerError', 'User with this email is already exists.')
            res.redirect('/auth/login#registration');
        } else {
            const hashPassword = await bcrypt.hash(password, 10);
            const user = new User({email: email, password: hashPassword, name: name});
            await user.save();
            res.redirect('/auth/login#login');
            await transporter.sendMail(registrationEmail(email))
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({errorCode: 500});
    }
});

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login')
    });
});

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Reset password',
        error: req.flash('error')
    })
})

router.post('/reset', async (req, res) => {
    try {
        const email = req.body.email
        const candidate = await User.findOne({email: email})

        if (candidate) {
            crypto.randomBytes(32, async (error, buffer) => {
                if (error) {
                    req.flash('error', "Something went wrong. Please retry later.")
                    return res.redirect('/auth/reset')
                }

                const token = buffer.toString('hex')
                candidate.resetToken = token
                candidate.resetTokenExpiration = Date.now() + 1000 * 60 * 60 * 24
                await candidate.save()
                await transporter.sendMail(resetPasswordEmail(email, token))
                res.redirect('/auth/login')
            })
        } else {
            res.redirect('/auth/login')
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({errorCode: 500})
    }
})

router.get('/password/:token', async (req, res) => {
    const token = req.params.token

    if (!token) {
        return res.redirect('/auth/login')
    }

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: {$gt: Date.now()}
        })

        if (user) {
            res.render('auth/password', {
                    title: 'Reset password',
                    error: req.flash('error'),
                    userId: user._id.toString(),
                    token: token
                }
            )
        } else {
            return res.redirect('/auth/login')
        }
    } catch (e) {
        console.log(e)
    }
})

router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExpiration: {$gt: Date.now()}
        })

        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10)
            user.resetToken = undefined
            user.resetTokenExpiration = undefined
            await user.save()
            res.redirect('/auth/login')
        } else {
            req.flash('loginError', "Token was expired")
            return res.redirect('/auth/login')
        }
    } catch (e) {
        console.log(e)
    }
})

module.exports = router;