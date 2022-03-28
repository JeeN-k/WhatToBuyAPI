const mongoose = require('mongoose');


const ProductListSchema = mongoose.Schema({
    name: String,
    color: String,
    icon: String,
    isRemoved: {
        type: Boolean,
        default: false
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    guests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
})

ProductListSchema.pre('remove', async function(next) {
    const User = mongoose.model('User');

    await User.updateOne(
        { _id: this.owner },
        { $pull: { productListsOwn: this._id } }
    );

    await User.updateMany( 
        { invites: { $in: this._id } },
        { $pull: { invites: this._id } }
    ) 

    await User.updateMany(
        { productListsForeign: { $in: this._id } },
        { $pull: { productListsForeign: this._id } }
    )

    await next();
})

module.exports = mongoose.model('ProductList', ProductListSchema)