const express=require('express');
const router = express.Router();
const User = require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const {saveRedirectUrl} = require('../middleware.js');

const userController = require('../controllers/user.js');

router.route("/signup")
.get(userController.signUpUser)
.post(wrapAsync(userController.createSignUpUser));

router.route("/login")
.get(userController.loginUser)
.post(saveRedirectUrl, passport.authenticate("local",{failureRedirect:'/login',failureFlash:true,}), userController.loginUserPost);

router.get("/logout", userController.logoutUser);

module.exports = router;