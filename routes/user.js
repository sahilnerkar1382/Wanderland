const express = require('express');
const router = express.Router();
const User = require('../models/users');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware');
const userController =  require('../controllers/users.js');


router 
  .route("/signup")
  .get( userController.rendersignup)
  .post(wrapAsync(userController.signup));

router
.route("login")
.get( userController.renderlogin)
.post(saveRedirectUrl, passport.authenticate('local', { 
    failureRedirect: '/login',
    failureFlash: true,
    }),
    userController.login 
)



router.get('/logout', userController.logout);

module.exports = router;