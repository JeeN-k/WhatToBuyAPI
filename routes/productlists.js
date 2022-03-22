const ProductList = require('../models/ProductList');
const User = require('../models/User');
const router = require('express').Router()
const verify = require('./verifyToken');

router.get('/', verify, (req, res) => {
    res.send(req.user)
})

router.post('/newProductList', verify, async (req, res) => {
    const productList = new ProductList({
        name: req.body.name,
        color: req.body.color,
        icon: req.body.icon,
        owner: req.body.userID
    })
    
    try {
        const savedProductList = await productList.save()
        const user = await User.findById(req.body.userID)
        await user.productLists.push(productList);
        await user.save()
        res.status(200).json({ message: "ProductList created", savedProductList})
    } catch (err) {
        res.json( { message: err })
    }
})

module.exports = router;