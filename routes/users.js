const router = require('express').Router();
const User = require('../models/User');

router.get('/userList', async (req, res) => {
    try {
        const user = await User.find({})
        res.status(200).json({ success: true, user })
    } catch(err) {
        res.status(400).send({ success: false, message: err })
    }    
});

router.delete('/all', async req => {
    await User.remove({})
})

module.exports = router;