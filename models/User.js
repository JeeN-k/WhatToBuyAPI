const mongoose = require('mongoose');


const UserSchema = mongoose.Schema({
    email: String,
    password: String,
    name: String,
    status: {
        type: String,
        enum: ['Pending', 'Active'],
        default: 'Pending'
    },
    confirmationCode: {
        type: String,
        unique: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    productListsOwn: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductList"
    }],
    productListForeign: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductList"
    }],
    invites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductList"
    }]
})

module.exports = mongoose.model('User', UserSchema)