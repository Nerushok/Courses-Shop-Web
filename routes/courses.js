const {Router} = require('express');
const Course = require('../models/course');
const {validationResult} = require('express-validator')
const {courseValidators} = require('../utils/validators')
const authMiddleware = require('../middleware/auth');

const router = Router();

router.get('/', async (req, res) => {
    const courses = await Course.find().populate('userId', 'email name');

    res.render('courses', {
        title: 'Courses',
        isCourses: true,
        userId: req.user._id ? req.user._id.toString() : null,
        courses
    });
});

router.get('/:id', async (req, res) => {
    console.log('ID: ' + req.body.id);
    const course = await Course.findById(req.params.id);
    res.render('course', {
        layout: 'empty',
        title: `Course ${course.title}`,
        course
    });
});

router.get('/:id/edit', authMiddleware, async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/')
    }

    try {
        const course = await Course.findById(req.params.id);

        if (course.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/')
        }

        res.render('course-edit', {
            title: `Edit ${course.title}`,
            course
        });
    } catch (e) {
        console.log(e)
    }
});

router.post('/edit', authMiddleware, courseValidators, async (req, res) => {
    const {id} = req.body;

    if (id.toString() !== req.user._id.toString()) {
        return res.redirect('/')
    }

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(422).redirect(`courses/${id}/edit?allow=true`)
    }

    delete req.body.id;
    await Course.findByIdAndUpdate(id, req.body);
    res.redirect('/courses');
});

router.post('/remove', authMiddleware, async (req, res) => {
    try {
        const {id} = req.body;
        await Course.deleteOne({
            _id: id,
            userId: req.user._id
        });
        res.redirect('/courses');
    } catch (e) {
        console.log(e)
    }
});

module.exports = router;