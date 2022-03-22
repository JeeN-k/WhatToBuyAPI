const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../validation');

router.post('/register', async (req,res) => {

    //validate data
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message })

    //Check email exist
    const emailExist = await User.findOne({ email: req.body.email })
    if (emailExist) return res.status(400).send({ message: 'Email already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        email: req.body.email,
        name: req.body.name,
        password: hashedPassword
    })
    try {
        const savedUser = await user.save()
        res.status(200).send({message: "User Registered", user: user._id })
    } catch (err) {
        res.status(400).send( { message: err })
    }
})

router.post('/login', async (req,res) => {
    //validate data
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message })
    //Check email exist
    const user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(400).send({ message: 'Email or password wrong' });

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send({ message: 'Email or password wrong' });

    const token = jwt.sign({ _id: user._id }, process.env.AUTH_TOKEN)
    res.header('auth-token', token).send({ message: 'Logged in', authToken: token })
})

module.exports = router;