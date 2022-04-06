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

const invitesResponse = {
    id: String,
    name: String,
    userName: String,
}

router.get('/invites', verify, async(req, res) => {
    try{
        const user = await User.findById(req.user._id)
        const productLists = await ProductList.find({ _id: { $in: user.invites}, isRemoved: false });
        const lists = await Promise.all(productLists.map( async(list) => {
            const userInvited = await User.findById(list.owner)
            invitesResponse.id = list.id
            invitesResponse.name = list.name
            invitesResponse.userName = userInvited.name
            return invitesResponse
        }))
        res.status(200).send({success: true, data: lists })
    } catch(err) {
        res.status(400).send({ success: false, message: err })
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
        const invite = user.invites.includes(req.query.listId)
        const owner = user.productListsOwn.includes(req.query.listId)
        const guest = user.productListsForeign.includes(req.query.listId)
        if ((invite) || (owner) || (guest)) return res.status(400).send({ success: false, message: "Пользователю уже отправлено приглашение!"})
        user.invites.push(req.query.listId)
        await user.save((err) => {
            if (err) {
                res.status(400).send({ success: false, message: "Error save user" })
            }
            res.status(200).send({ success: true, message: "Приглашение отправлено!" })
        })
    } catch (err) {
        res.status(400).send({ success: false, message: "Ошибка! Пользователь не найден"})
    }
})

router.patch('/acceptInvite', verify, async(req, res) => {   
    try {
        const user = await User.findById(req.user._id)
        await user.updateOne(
            { $pull: { invites: req.query.listId } }
        )
        await user.productListsForeign.push(req.query.listId)      
        await user.save()  
        const productList = await ProductList.findById(req.query.listId)
        await productList.guests.push(req.user._id)
        await productList.save()
        res.status(200).json( {success: true, message: "Приглашение принято!"} )
    } catch(err) {
        res.status(400).json( {success: false, message: "Ошибка принятия приглашения!" } )
    }
})

router.patch('/refuseInvite', verify, async(req, res) => {
    try {
        const user = await User.findById(req.user._id)
        await user.updateOne(
            { $pull: { invites: req.query.listId } }
        )
        await user.save()
        res.status(200).json( { success: true, message: "Приглашение отклонено!" })
    } catch(err) {
        res.status(400).json({ success: false, message: "Ошибка!" })
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
        res.status(200).send({ success: true, message: "Список обновлен!" })
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