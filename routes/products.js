const express = require('express');
const verify = require('./verifyToken');
const router = express.Router()
const Product = require('../models/Product');
const ProductList = require('../models/ProductList');

router.get('/byProductList', verify, async (req, res) => {
    try {
        const products = await Product.find({ owner: req.query.listId });
        res.status(200).json({ success: true, products })
    } catch(err) {
        res.status(400).send({ success: false, message: err })
    }    
});

router.get('/byId', async (req,res) => {
    
})

router.post('/create', verify, async (req,res) => {
    const product = new Product(req.body)
    product.owner = req.query.listId
    
    try {    
        await product.save()    
        const productList = await ProductList.findById(req.query.listId)
        productList.products.push(productList);
        await productList.save()
        res.status(200).send({ success: true, data: product })
    } catch (err) {
        res.status(400).send({ success: false, message: err })
    }
})

router.delete('/:productId', verify, async (req, res) => {
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