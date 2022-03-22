const express = require('express');
const router = express.Router()
const Product = require('../models/Product');

router.get('/', async (req, res) => {
    try {
        const products = await Product.find()
        res.json(products)
    } catch (err) {
        res.json({ message:err })
    }
});

router.post('/', async (req,res) => {
    const product = new Product({
        name: req.body.name,
        category: req.body.category,
        isBought: req.body.isBought,
        count: req.body.count
    })
    try {
        const savedProduct = await product.save()
        res.json(savedProduct)
    } catch (err) {
        res.json( { message: err })
    }
})

router.delete('/:productId', async (req, res) => {
    try {
        const removedProduct = await Product.deleteOne({ _id: req.params.productId });
        res.json(removedProduct)
    } catch(err) {
        res.json( { message: err })
    }

})

router.patch('/:productId', async (req,res) => {
    try {
        const updatedProduct = await Product.updateOne(
            { _id: req.params.productId },
            { $set: { name: req.body.name } }
        )
        res.json(updatedProduct)
    } catch(err) {
        res.json( { message: err })
    }
})

module.exports = router;