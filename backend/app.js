require('dotenv').config()
const path = require('path')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const postsRoutes = require('./routes/posts')
const userRoutes = require('./routes/user')

mongoose.connect(process.env.DATABASE).then(() => {
    console.log('Connected to database!')
}).catch(() => {
    console.log('Connection to database failed!')
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/uploads', express.static(path.join('backend/uploads')))
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
    next()
})
app.use('/api/posts', postsRoutes)
app.use('/api/user', userRoutes)

module.exports = app