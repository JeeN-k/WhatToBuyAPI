const mongoose = require('mongoose');


const ProductSchema = mongoose.Schema({
    name: String,
    category: String,
    isBought: Boolean,
    count: Number,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductList",
        required: true
    }
})

module.exports = mongoose.model('Product', ProductSchema)