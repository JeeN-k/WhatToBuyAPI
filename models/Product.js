const mongoose = require('mongoose');


const ProductSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    note: {
        type: String,
        default: null
    },
    isBought: {
        type: Boolean,
        default: false
    },
    count: {
        type: Number,
        default: null
    },
    productList: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductList",
        required: true
    }
})

ProductSchema.pre('remove', async function(next) {
    const ProductList = mongoose.model('ProductList');

    await ProductList.updateOne(
        { _id: this.productList },
        { $pull: { products: this._id } }
    );

    await next();
})

module.exports = mongoose.model('Product', ProductSchema)