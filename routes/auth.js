const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('../config/nodemailer.config');
const { registerValidation, loginValidation } = require('../validation');

router.post('/signup', async (req,res) => {

    //validate data
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message })

    //Check email exist
    const emailExist = await User.findOne({ email: req.body.email })
    if (emailExist) return res.status(400).send({ message: 'Email already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const token = jwt.sign({email: req.body.email}, process.env.AUTH_TOKEN)

    const user = new User({
        email: req.body.email,
        name: req.body.name,
        password: hashedPassword,
        confirmationCode: token
    })

    await user.save((err, user) => {
        if (err) {
            res.status(400).send({ success: false, message: err });
            return;
        }

        res.status(200).send({ success: true, message: "User was registered successfully! Please check your email" })

        nodemailer.sendConfirmationEmail(user.name, user.email, user.confirmationCode)
    })
})

router.get('/resendMail', async (req,res) => {
    await User.findOne({ email: req.body.email }).then((user) => {
        if (user.status != 'Active') {
            res.status(200).send({ success: true, message: "Message was sent" })
            nodemailer.sendConfirmationEmail(user.name, user.email, user.confirmationCode)
        } else {
            res.status(400).send({ success: false, message: "Email already confirmed."})
        }
    })

})

router.post('/signin', async (req,res) => {
    //validate data
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message })
    //Check email exist
    const user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(400).send({ message: 'Email or password wrong' });

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send({ message: 'Email or password wrong' });

    if (user.status != 'Active') return res.status(401).send({ message: "Pending account. Please Verify Your Email!" })

    const token = jwt.sign({ _id: user._id }, process.env.AUTH_TOKEN)
    res.status(200).send({ success: true, authToken: token })
})

router.get("/confirm/:confirmationCode", async (req,res, next) => {
    User.findOne({ confirmationCode: req.params.confirmationCode })
    .then((user) => {
        if (!user) {
            return res.status(404).send({ message: "User not found."})
        }

        user.status = "Active";
        user.save((err) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            res.status(200).send("Почта успешно подтверждена!")
        })
    })
    .catch((e) => console.log("error", e))
})

module.exports = router;