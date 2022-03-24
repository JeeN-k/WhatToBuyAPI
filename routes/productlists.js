const ProductList = require('../models/ProductList');
const User = require('../models/User');
const router = require('express').Router()
const verify = require('./verifyToken');

router.get('/byUser', verify, async (req, res) => {
    try {
        const productLists = await ProductList.find({owner: req.user});
        res.status(200).json({success: true, productLists})
    } catch(err) {
        res.status(400).send({ success: false, message: err })
    }    
})

router.get('/byId', verify, async (req, res) => {
    try {
        const productList = await ProductList.findOne({ _id: req.query.listID })
        res.status(200).json({ success: true, productList })
    } catch(err) {
        res.status(400).send({ success: false, message: err })
    }    
})

router.post('/new', verify, async (req, res) => {
    const productList = new ProductList(req.body)
    productList.owner = req.user
    
    try {    
        await productList.save()    

        const user = await User.findById(req.user)
        user.productLists.push(productList);
        await user.save()
        res.status(200).send({ success: true, data: productList})
    } catch (err) {
        res.status(400).send({ success: false, message: err })
    }
})

router.patch('/update', verify, async (req, res) => {
    const newValues = {
        $set: {
            name: req.body.name,
            color: req.body.color,
            icon: req.body.icon
        }
    }
    try {
        const update = await ProductList.updateOne({ _id: req.query.listId}, newValues)
        res.status(200).send({ success: true, update })
    } catch(err) {
        res.status(400).send({ success: false, err })
    }
})

router.delete('/delete', verify, async (req, res) => {
    try {
        const deleteResult = await ProductList.deleteOne({ _id: req.query.listId });        
        if (deleteResult.deletedCount == 1) {
            res.status(200).json( { success: true, deleteResult})
        } else {
            res.status(400).json( { success: false, message: "No lists matched the query. Deleted 0 documents" })
        }
    } catch(err) {
        res.status(400).json( { message: err })
    }
})

module.exports = router;