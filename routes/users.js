const router = require('express').Router();
const res = require('express/lib/response');
const User = require('../models/User');

router.get('/userList', async (req, res) => {
    try {
        const user = await User.find({})
        res.status(200).json({ success: true, user })
    } catch(err) {
        res.status(400).send({ success: false, message: err })
    }    
});

router.delete('/all', async (req, res) => {
    try {
        await User.remove({})
        res.status(200).send("Deleted")
    } catch (err) {
        res.status(400).json(err)
    }
})

module.exports = router;