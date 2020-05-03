const {Router} = require('express');
const Course = require('../models/course');
const authMiddleware = require('../middleware/auth');
const router = Router();

router.post('/add', authMiddleware, async (req, res) => {
    const course = await Course.findById(req.body.id);
    await req.user.addToCart(course);
    res.redirect('/card');
});

router.get('/', authMiddleware,  async (req, res) => {
    const user = await req.user
        .populate('cart.items.courseId')
        .execPopulate();

    const courses = mapCartToCourses(user.cart);
    const totalPrice = sumTotalPrice(courses);

    res.render('card', {
        title: "Cart",
        isCart: true,
        courses: courses,
        price: totalPrice
    });
});

router.delete("/remove/:id", authMiddleware, async (req, res) => {
    await req.user.removeFromCart(req.params.id);
    const user = await req.user
        .populate('cart.items.courseId')
        .execPopulate();

    const courses = mapCartToCourses(user.cart);
    const cart = {courses, price: sumTotalPrice(courses)};

    res.status(200).json(cart);
});

function mapCartToCourses(cart) {
    return cart.items.map(course => ({
        ...course.courseId._doc,
        id: course.courseId.id,
        count: course.count
    }));
}

function sumTotalPrice(courses) {
    return courses.reduce((total, course) => {
        return total += course.price * course.count;
    }, 0);
}

module.exports = router;