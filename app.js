const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv/config');

const productsRoute = require('./routes/products');
const productlistsRoute = require('./routes/productlists');
const usersRoute = require('./routes/users');
const authRoute = require('./routes/auth');

app.use(bodyParser.json())

app.use('/api/products', productsRoute)
app.use('/api/productlists', productlistsRoute)
app.use('/api/users', usersRoute)
app.use('/api/auth', authRoute)

mongoose.connect(process.env.DB_CONNECTION, () => {
    console.log('Connected to DB!')
})

// Listen
app.listen(process.env.port);