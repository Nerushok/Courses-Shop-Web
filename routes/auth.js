const {Router} = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const router = Router();


router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Login',
        isLogin: true
    });
});

router.get('/registration', async (req, res) => {
    res.render('auth/registration', {
        title: 'Registration',
        isLogin: true
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
                res.redirect('/auth/login#login')
            }
        } else {
            res.redirect('/auth/login#login')
        }
    } catch (e) {
        console.log(e);
        req.statusCode(500).json({errorCode: 500});
    }
});

router.post('/registration', async (req, res) => {
    try {
        const {name, email, password, confirmPassword} = req.body;
        const candidate = await User.findOne({email: email});

        if (candidate) {
            res.redirect('/auth/login#register');
        } else {
            const hashPassword = await bcrypt.hash(password, 10);
            const user = new User({email: email, password: hashPassword, name: name});
            await user.save();
            res.redirect('/auth/login#login');
        }
    } catch (e) {
        console.log(e);
        res.statusCode(500).json({errorCode: 500});
    }
});

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login')
    });
});

module.exports = router;