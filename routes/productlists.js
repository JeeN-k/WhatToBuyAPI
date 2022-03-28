const ProductList = require('../models/ProductList');
const User = require('../models/User');
const router = require('express').Router()
const verify = require('../middleware/verifyToken');

router.get('/byUser', verify, async (req, res) => {
    try {
        const productLists = await ProductList.find({ $or: [{owner: req.user}, {guests: { $in: req.user }}], isRemoved: false });
        res.status(200).json({success: true, productLists})
    } catch(err) {
        res.status(400).send({ success: false, message: err })
    }    
})

router.get('/all', async (req, res) => {
    try {
        const productList = await ProductList.find({})
        res.status(200).json({ success: true, productList })
    } catch(err) {
        res.status(400).send({ success: false, message: err })
    }  
})

router.get('/byUserRemoved', verify, async (req, res) => {
    try {
        const productLists = await ProductList.find({ owner: req.user, isRemoved: true });
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
        res.status(400).json({ success: false, message: err })
    }    
})

router.post('/new', verify, async (req, res) => {
    const productList = new ProductList(req.body)
    productList.owner = req.user
    
    try {    
        await productList.save()    

        const user = await User.findById(req.user._id)
        user.productListsOwn.push(productList);
        await user.save()
        res.status(200).send({ success: true, data: productList})
    } catch (err) {
        res.status(400).send({ success: false, message: err })
    }
})

router.patch('/invite', verify, async(req, res) => {
    const user = await User.findOne({ email: req.query.email })
    user.invites.push(req.query.listId)
    await user.save((err) => {
        if (err) {
            res.status(400).send({ message: err })
        }
        res.status(200).send({ success: true, message: "Invited" })
    })
})

router.patch('/acceptInvite', verify, async(req, res) => {   
    try {
    const user = await User.findById(req.user._id)
    await user.updateOne(
        { $pull: { invites: req.query.listId } }
    )
    await user.productListForeign.push(req.query.listId)      
    await user.save()  
    const productList = await ProductList.findById(req.query.listId)
    await productList.guests.push(req.user._id)
    await productList.save()
    res.status(200).json( {message: "ok"} )
    } catch(err) {
        console.log(err)
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

router.patch('/removeToTrash', verify, async (req,res) => {
    const newValue = { $set: { isRemoved: true }}
    try {
        const update = await ProductList.updateOne({ _id: req.query.listId}, newValue )
        res.status(200).send({ success: true, update })
    } catch(err) {
        res.status(400).send({ success: false, err })
    }
})

router.patch('/restoreFromTrash', verify, async(req,res) => {
    const newValue = { $set: { isRemoved: false }}
    try {
        const update = await ProductList.updateOne({ _id: req.query.listId}, newValue )
        res.status(200).send({ success: true, update })
    } catch(err) {
        res.status(400).send({ success: false, err })
    }
})

router.delete('/:listId', verify, async (req, res) => {
    try {
        await ProductList.findOne({ _id: req.params.listId}, async (err, list) => {
            return await list.remove(err => {
                if (!err) { res.status(200).json( { success: true, message: "Deleted"}) }
                else { res.status(400).json( { message: err }) }
            })
        }).clone()
    } catch(err) {
        res.status(400).json( { message: err })
    }
})

router.delete('/', async (req, res) => {
    await ProductList.remove({})
})

module.exports = router;