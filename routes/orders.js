const {Router} = require('express');
const Order = require('../models/order');
const authMiddleware = require('../middleware/auth');
const router = Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const orders = await Order
            .find({'user.userId': req.user._id})
            .populate('user.userId');

        res.render('orders', {
            isOrders: true,
            title: 'Orders',
            orders: mapOrders(orders)
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({errorCode: 500});
    }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        const user = await req.user
            .populate('cart.items.courseId')
            .execPopulate();

        const courses = user.cart.items.map(item => ({
            count: item.count,
            course: {...item.courseId._doc}
        }));

        const order = new Order({
            user: {
                name: user.name,
                userId: req.user
            },
            courses
        });

        await order.save();
        await req.user.clearCart();

        res.redirect('/orders')
    } catch (e) {
        console.log(e);
        res.status(500).json({errorCode: 500});
    }
});

function mapOrders(orders) {
    return orders.map(order => {
        return {
            ...order._doc,
            totalPrice: order.courses.reduce((total, c) => {
                return total += c.course.price * c.count
            }, 0)
        }
    })
}

module.exports = router;