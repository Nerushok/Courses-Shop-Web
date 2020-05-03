const {Router} = require('express');
const Course = require('../models/course');
const authMiddleware = require('../middleware/auth');

const router = Router();

router.get('/', async (req, res) => {
    const courses = await Course.find().populate('userId', 'email name');

    res.render('courses', {
        title: 'Courses',
        isCourses: true,
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

    const course = await Course.findById(req.params.id);

    res.render('course-edit', {
        title: `Edit ${course.title}`,
        course
    });
});

router.post('/edit', authMiddleware, async (req, res) => {
    const {id} = req.body;
    delete req.body.id;
    await Course.findByIdAndUpdate(id, req.body);
    res.redirect('/courses');
});

router.post('/remove', authMiddleware, async (req, res) => {
    try {
        const {id} = req.body;
        await Course.deleteOne({_id: id});
        res.redirect('/courses');
    } catch (e) {
        console.log(e)
    }
});

module.exports = router;