const express = require('express')
const router = express.Router()
const User = require('../modelSchema/userSchema')
const {userLogin, userSignup, userLogout} = require('../Controllers/authController')

router.post('/login', userLogin)

router.post('/signup', userSignup)

router.post('/logout', userLogout)






module.exports = router