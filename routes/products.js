const express = require('express');
const verify = require('../middleware/verifyToken');
const router = express.Router()
const Product = require('../models/Product');
const ProductList = require('../models/ProductList');

router.get('/byList', verify, async (req, res) => {
    try {
        const products = await Product.find({ productList: req.query.listId });
        res.status(200).json({ success: true, products })
    } catch(err) {
        res.status(400).send({ success: false, message: err })
    }    
});

router.get('/byId', async (req,res) => {
    try {
        const product = await Product.findById(req.query.productId)
        if (!product) return res.status(400).json({ success: false, product})
        res.status(200).json({ success: true, product})
    } catch(err) {
        res.status(400).send({ success: false, message: err })
    }
})

router.patch('/bought', verify, async (req, res) =>  {
    const newValues = {
        $set: {
            isBought: req.query.isBought,
        }
    }
    try {
        const update = await Product.updateOne({ _id: req.query.productId}, newValues)
        res.status(200).send({ success: true, update })
    } catch(err) {
        res.status(400).send({ success: false, err })
    }
})

router.post('/create', verify, async (req,res) => {
    const product = new Product(req.body)
    product.productList = req.query.listId
    
    try {    
        await product.save()    
        const productList = await ProductList.findById(req.query.listId)
        productList.products.push(product);
        await productList.save()
        res.status(200).send({ success: true, data: product })
    } catch (err) {
        res.status(400).send({ success: false, message: err })
    }
})

router.patch('/:productId', verify, async (req,res) => {
    const newValues = {
        $set: {
            name: req.body.name,
            category: req.body.category,
            note: req.body.note,
            count: req.body.count    
        }
    }
    try {
        const update = await Product.updateOne({ _id: req.params.productId}, newValues)
        res.status(200).send({ success: true, update })
    } catch(err) {
        res.status(400).send({ success: false, err })
    }
})

router.delete('/:productId', verify, async (req, res) => {
    try {
        await Product.findById(req.params.productId, async (err, product) => {
            if (!product) return res.status(400).json({ success: false, message: "Not found product" })
            return await product.remove(err => {
                if (!err) { res.status(200).json({ success: true, message: "Product deleted!"})}
                else { res.status(400).json( {message: err })}
            })
        }).clone()
    } catch(err) {
        console.log(err)
    }
})

module.exports = router;