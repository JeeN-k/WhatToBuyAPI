const ProductList = require('../models/ProductList');
const User = require('../models/User');
const router = require('express').Router()
const verify = require('../middleware/verifyToken');

router.get('/byUser', verify, async (req, res) => {
    try {
        const productLists = await ProductList.find({ $or: [{owner: req.user}, {guests: { $in: req.user }}], isRemoved: false });
        res.status(200).json({success: true, data: productLists})
    } catch(err) {
        res.status(400).send({ success: false, message: err })
    }    
})

router.get('/all', async (req, res) => {
    try {
        const productList = await ProductList.find({})
        res.status(200).json({ success: true, data: productList })
    } catch(err) {
        res.status(400).send({ success: false, message: err })
    }  
})

router.get('/byUserRemoved', verify, async (req, res) => {
    try {
        const productLists = await ProductList.find({ owner: req.user, isRemoved: true });
        res.status(200).json({success: true, data: productLists})
    } catch(err) {
        res.status(400).send({ success: false, data: err })
    }   
})

router.get('/byId', verify, async (req, res) => {
    try {
        const productList = await ProductList.findOne({ _id: req.query.listID })
        res.status(200).json({ success: true, data: productList })
    } catch(err) {
        res.status(400).json({ success: false, message: err })
    }    
})

router.post('/create', verify, async (req, res) => {
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
    try {
        const user = await User.findOne({ email: req.query.email })
        user.invites.push(req.query.listId)
        await user.save((err) => {
            if (err) {
                res.status(400).send({ success: false, message: "Error save user" })
            }
            res.status(200).send({ success: true, message: "Invited" })
        })
    } catch (err) {
        res.status(400).send({ success: false, message: "Error invite user/User you want to invite not found"})
    }
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
        res.status(200).json( {success: true, message: "Invite accepted"} )
    } catch(err) {
        res.status(400).json( {success: false, message: err } )
    }
})

router.patch('/update/:listId', verify, async (req, res) => {
    const newValues = {
        $set: {
            name: req.body.name,
            color: req.body.color,
            icon: req.body.icon
        }
    }
    try {
        const update = await ProductList.updateOne({ _id: req.params.listId}, newValues)
        res.status(200).send({ success: true, message: "Successfully updated" })
    } catch(err) {
        res.status(400).send({ success: false, message: "Error update" })
    }
})

router.patch('/removeToTrash', verify, async (req,res) => {
    const newValue = { $set: { isRemoved: true }}
    try {
        const update = await ProductList.updateOne({ _id: req.query.listId}, newValue )
        res.status(200).send({ success: true, message: "List removed to trash" })
    } catch(err) {
        res.status(400).send({ success: false, message: "Error with removed" })
    }
})

router.patch('/restoreFromTrash', verify, async(req,res) => {
    const newValue = { $set: { isRemoved: false }}
    try {
        const update = await ProductList.updateOne({ _id: req.query.listId}, newValue )
        res.status(200).send({ success: true, message: "List restored from trash" })
    } catch(err) {
        res.status(400).send({ success: false, message: "Error with list restore" })
    }
})

router.delete('/:listId', verify, async (req, res) => {
    try {
        await ProductList.findOne({ _id: req.params.listId}, async (err, list) => {
            if (!list) return res.status(400).json({ success: false, message: "Not found list" })
            return await list.remove(err => {
                if (!err) { res.status(200).json( { success: true, message: "Deleted"}) }
                else { res.status(400).json( { success: false, message: err }) }
            })
        }).clone()
    } catch(err) {
        res.status(400).json( { success: false, message: err })
    }
})

router.delete('/', async (req, res) => {
    await ProductList.remove({})
})

module.exports = router;