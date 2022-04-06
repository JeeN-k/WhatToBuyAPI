const router = require('express').Router();
const verify = require('../middleware/verifyToken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

router.get('/userList', async (req, res) => {
    try {
        const user = await User.find({})
        res.status(200).json({ success: true, user })
    } catch(err) {
        res.status(400).send({ success: false, message: err })
    }    
});

router.patch('/resetPassword', verify, async (req, res) => {
        //Check email exist
        const user = await User.findById(req.user._id)
    
        const validPass = await bcrypt.compare(req.body.oldPassword, user.password);
        if (!validPass) return res.status(400).send({ success: false, message: 'Неверно указан старый пароль!' });
        
            // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);
        try {
            user.password = hashedPassword
            await user.save()
            res.status(200).send({ success: true, message: "Пароль успешно изменен"})
        } catch(error) {
            res.status(400).send({ success: false, message: "Error", err})
        }
})

module.exports = router;