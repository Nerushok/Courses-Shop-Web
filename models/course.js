const {Schema, model} = require('mongoose');

const courseSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    img: String,
    userId: {
        type: Schema.Types.ObjectID,
        ref: 'User'
    }
});

courseSchema.methods.toClient = function() {
    const course = this.toObject();

    course.id = this._id;
    delete course._id;

    return this
};

module.exports = model('Course', courseSchema);