import express from 'express'
const router = express.Router()
import passport from 'passport'


//import UserController from '../Controllers/usersController'

import * as UserController from '../Controllers/usersController.js'


router.get('/', UserController.index)
router.post('/login', UserController.login)
router.route("/register").post(UserController.register)
router.delete('/delete/{_id}', UserController.deletee)
router.post("/send-confirmation-email", UserController.sendConfirmationEmail)
router.get("/confirmation/:token", UserController.confirmation)
router.post('/forgotPassword',UserController.forgotPassword)
router.post("/confirmationOtp",UserController.confirmationOTP)
router.post("/confirmationOtp1",UserController.confirmationOTP1)
router.post("/resetPassword",UserController.resetPassword)

//facebook part
router.get("/auth/facebook", passport.authenticate("facebook"))
router.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", {
      successRedirect: "/",
      failureRedirect: "/fail"
    })
  );
  router.get("/fail", (req, res) => {
    res.send("Failed attempt");
  });
  router.get("/", (req, res) => {
    res.send("Success");
  });
  //it ends here.

  //google route
  router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

  router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
  //it ends here.

export default router
