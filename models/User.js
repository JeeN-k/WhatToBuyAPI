const mongoose = require('mongoose');


const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        max: 255,
        min: 4
    },
    password: {
        type: String,
        required: true,
        max: 1024,
        min: 6
    },
    name: {
        type: String,
        required: true,
        max: 255, 
        min: 6
    },
    date: {
        type: Date,
        default: Date.now
    },
    productLists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductList"
    }]
})

module.exports = mongoose.model('User', UserSchema)