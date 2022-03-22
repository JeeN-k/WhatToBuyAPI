const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv/config');

const productsRoute = require('./routes/products');
const productlistsRoute = require('./routes/productlists');
const usersRoute = require('./routes/users');

app.use(bodyParser.json())

app.use('/api/product', productsRoute)
app.use('/api/productlist', productlistsRoute)
app.use('/api/user', usersRoute)

mongoose.connect(process.env.DB_CONNECTION, () => {
    console.log('Connected to DB!')
})

// Listen
app.listen(3000);