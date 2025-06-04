const express = require('express')
const router = express.Router()
const User = require('../modelSchema/userSchema')
const authenticate = require('./authMiddleware')
const {userLogin, 
    userSignup, 
    userLogout, 
    userForgotPassword,
    getCurrentUser,
    resetPassword} = require('../Controllers/authController')


router.post('/login', userLogin)

router.post('/signup', userSignup)

router.post('/logout', userLogout)

router.post('/forgot-password', userForgotPassword)


router.post('/reset-password', resetPassword)

router.get('/get-user', authenticate,  getCurrentUser) 








module.exports = router