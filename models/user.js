const {Schema, model} = require('mongoose');

const userSchema = new Schema({
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        avatarUrl: String,
        resetToken: String,
        resetTokenExpiration: Date,
        name: {
            type: String,
            required: true
        },
        cart: {
            items: [
                {
                    courseId: {
                        type: Schema.Types.ObjectID,
                        ref: 'Course',
                        required: true
                    },
                    count: {
                        type: Number,
                        required: true,
                        default: 1
                    }
                }
            ]
        }
    }
);

userSchema.methods.addToCart = function (course) {
    const cartItems = [...this.cart.items];
    const index = cartItems.findIndex(item => item.courseId.toString() === course._id.toString());

    if (index >= 0) {
        cartItems[index].count = cartItems[index].count + 1;
    } else {
        cartItems.push({
            courseId: course._id,
            count: 1
        });
    }

    this.cart = {items: cartItems};
    return this.save();
};

userSchema.methods.removeFromCart = function (id) {
    const cartItems = [...this.cart.items];
    const index = cartItems.findIndex(item => item.courseId.toString() === id.toString());

    if (index < 0) return;

    const course = cartItems[index];

    if (course.count > 1) {
        course.count--;
    } else {
        cartItems.splice(index, 1);
    }

    this.cart = {items: cartItems};
    return this.save();
};

userSchema.methods.clearCart = function () {
    this.cart = {items: []};
    return this.save();
};

module.exports = model('User', userSchema);