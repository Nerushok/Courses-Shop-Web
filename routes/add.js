const {Router} = require('express');
const authMiddleware = require('../middleware/auth');
const Course = require('../models/course');

const router = Router();

router.get('/', authMiddleware, (req, res) => {
    res.render('add', {
        title: 'Add course',
        isAdd: true
    })
});

router.post('/', authMiddleware,  async (req, res) => {
    const course = new Course({
        title: req.body.title,
        price: req.body.price,
        img: req.body.img,
        userId: req.user._id
    });

    try {
        await course.save();
        res.redirect('/courses');
    } catch (e) {
        console.log(e)
    }
});

module.exports = router;