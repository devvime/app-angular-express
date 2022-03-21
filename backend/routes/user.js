const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

router.post('/signup', (req, res) => {
    bcrypt.hash(req.body.password, 10).then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash
        })
        user.save().then(result => {
            res.json({
                message: 'User created!',
                result: result
            })
        }).catch(error => {
            console.log(error)
        })
    })
})

module.exports = router