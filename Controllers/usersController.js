import User from '../Models/UserModel.js'
import  bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import otpGenerator from 'otp-generator'
import hbs from 'nodemailer-express-handlebars'
import * as dotenv from 'dotenv'  
import passport from 'passport'
import strategy from "passport-facebook"
import strat from 'passport-google-oauth20'








//Add User

export async function register (req, res, next) {
 const emailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  try {  
  const { fullname, email, password, numTel} = req.body
 let profilepic;
  if (req.file) {
     profilepic = req.file.profilepic
   }

  console.log(fullname,email)
 
      if ( !(
          fullname &&
          email &&
          password &&
          numTel 
        ))
         {
        //res.status(400).send('Required Inputs')
        console.log("inputs required")
        return res.status(400).send({ message:'Required Inputs'})
      }

      if (emailValid.test(email) == false) {
        console.log("email invalid")
        return res.status(400).send({message:'email invalid'}) 
        //res.status(400).send('email invalid')
        //return
      }
  
      //checking the existance of user
    if (await User.findOne({ email })) {
      return  res.status(403).send({ message: "User already exist !" })
      } else {

    let user = await new User({
        fullname,
        profilepic: "localhost:9092/img/"+profilepic+".png",
        email,
        password:await bcrypt.hash(password, 10),
        numTel: req.body.numTel,
        otp:parseInt(Math.random()*10000),
        role: "ROLE_USER", //req.body.role,
        isVerified: true
    })
    user.save()
    .then(user => {
      sendEmailtest(user.email,user.otp)
       return res.json({
            message: 'User added successfully!'
        })
    })
    .catch(error => {
       return res.json({
            message: 'An error occured!'
        })
    })
}//res.send(user)
} catch (err) {
  console.log(err)
  return res.send(err)
}
}


//Login
export async function login (req, res)  {
    const { email, password } = req.body
    console.log("email", email)
    if (!(email && password)) {
      res.status(400).send('Required Input')
    }
  
    const user = await User.findOne({ email })
    
  
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateUserToken(user)
      console.log("token = ",token)
  
      if (!user.isVerified) {
        return res.status(403).send({ user, message: "email non verifié" })
      } else {
        dotenv.config()
        
        return res.status(200).send({ token, user, message: "success" })
      }
    } else {
        return res.status(403).send({ message: "mot de passe ou email incorrect" })
    }
  }

  //Facebook Authentication

  const FacebookStrategy = strategy.Strategy;

  dotenv.config();
  passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });
  
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ["email", "name"]
      },
      function(accessToken, refreshToken, profile, done) {
        const { email, first_name } = profile._json;
        const userData = {
          email,
          fullname: first_name
        };
        new User(userData).save();
        done(null, profile);
      }
    )
  );

  //Login Google //"http://www.example.com/auth/google/callback"

  var GoogleStrategy = strat.Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

  //Login Google //"http://www.example.com/auth/google/callback"

  var GoogleStrategy = strat.Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
//Show the list of Users

export function index (req, res, next)  {
    User.find()
    .then(response =>{
        res.json({
            response
        })
    })
    .catch(error => {
        res.json ({
            message: 'An error occured. '
        }) 
    })
}

// Show single user
export function show (req, res, next ) {
    let userID = req.body._id    
    User.findById(userID)
    .then(response => {
        res.json({
            response
        })
    })
    .catch(error => {
        res.json()
        message: 'An error occured'
    })

}




// Update User

export async function updateProfile  (req, res) {
    const { fullname, email,  numTel, isVerified, role } = req.body
  
    let user = await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          email,
          fullname,
          numTel,
          profilepic: req.file.filename,
          isVerified,
          role
        },
      }
    )
  
    return res.send({ message: "Profile updated successfully", user })
  }
  



// Delete a user

export  async function deletee (req, res) {
    let user = await User.findById(req.body._id)
    if (user) {
      await user.remove()
      return res.send({ message: "User" + user._id + " has been deleted" })
    } else {
      return res.status(404).send({ message: "User does not exist" })
    }
  }



// Delete all Clients 

export async function deleteAll (req, res) {
    await User.remove({})
    res.send({ message: "All users have been deleted" })
  }

  

//Update pwd 
export async function updatePassword  (req, res)  {
    const { email, newPassword } = req.body
  
    if (newPassword) {
      newPasswordEncrypted = await bcrypt.hash(newPassword, 10)
  
      let user = await user.findOneAndUpdate(
        { email: email },
        {
          $set: {
            password: newPasswordEncrypted,
          },
        }
      )
  
      return res.send({ message: "Password updated successfully", user })
    } else {
      return res.status(403).send({ message: "Password should not be empty" })
    }
  } 

  
//send confirmation mail 

  export async function sendConfirmationEmail(req, res) {
    //finding the user mail
    const user = await User.findOne({ email: req.body.email.toLowerCase() })
    //generating token
    if (user) {
      let token = new Token({
        userId: user._id,
        token: jwt.sign(
          { user },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '1H' },
        ),
      })
      //sending mail
      await doSendConfirmationEmail(req.body.email, token.token)
  
      res.status(200).send({
        message: "Mail de confirmation a ete envoye à" + user.email,
      })
    } else {
      res.status(404).send({ message: 'User innexistant' })
    }
  }
  
  async function doSendConfirmationEmail(email, token) {
    let port = process.env.PORT || 9090
   
    sendEmail({
      from: process.env.savy_mail,
      to: email,
      subject: 'Confirm your email',
      template: 'email' ,
      context: {
          port : port,
          token : token
      }
    })
  }
  
  function sendEmail(mailOptions) {
      let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.savy_mail,
            pass: process.env.savy_password,
          },
        })
        const handlebarOptions = {
          viewEngine: {
            extName: ".html",
            partialsDir: path.resolve('./views'),
            defaultLayout: false,
          },
          viewPath: path.resolve('./views'),
          extName: ".html",
        }
        transporter.use('compile', hbs(handlebarOptions))
      
        transporter.verify(function (error, success) {
          if (error) {
            console.log(error)
            console.log('Server not ready')
          } else {
            console.log('Server is ready to take our messages')
          }
        })
      
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error)
          } else {
            console.log('Email sent: ' + info.response)
          }
        })
  }
  
  export async function confirmation(req, res) {
    if (req.params.token) {
      try {
          let token = jwt.verify(req.params.token, process.env.ACCESS_TOKEN_SECRET)
          console.log(token.user._id);
      } catch (err) {
        return res.status(200).json({"error" : "erreur"})
      }
    } else {
      return res.status(200).json({"error" : "erreur"})
    }
    let token = jwt.verify(req.params.token, process.env.ACCESS_TOKEN_SECRET)
    console.log(token);
    User.findById(token.user._id, function (err, user) {
      if (!user) {
        return res.status(200).json({"error" : "user does Not Exist"})
      } else if (user.verified) {
        return res.status(200).json({"error" : "user alerady verified"})
      } else {
        user.verified = true
        user.save(function (err) {
          if (err) {
            return res.status(400).json({"error" : "erreur"})
          } else {
            return res.status(200).json({"success" : "user verified"})
          }
        })
      }
    })
  }


  //FORGOT PASSWORD

  export async function forgotPassword (req, res) {
    let OTP = otpGenerator.generate(4,{upperCaseAlphabets:false,specialChars:false,digits:true,lowerCaseAlphabets:false})
    const user = await User.findOneAndUpdate({ email: req.body.email},{otp: OTP})
    if (user) {
      sendEmailtest(req.body.email, OTP)
      res.status(200).send({
        message: "L'email de reinitialisation a été envoyé a " + user.email,
      })
    } else {
      res.status(404).send({ message: "User innexistant" })
    }
  }
  async function sendOTP(email) {
    const user = await User.findOne({ email: email })
    sendEmailOTP({
      from: process.env.savy_mail,
      to: email,
      subject: "Password reset",
      template: 'otp',
      context: {
        OTP : user.otp
      }
    })
  }
  function sendEmailOTP(mailOptions) {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.savy_mail,
        pass: process.env.savy_password,
      },
    })
    const handlebarOptions = {
      viewEngine: {
        extName: ".html",
        partialsDir: path.resolve('./views'),
        defaultLayout: false,
      },
      viewPath: path.resolve('./views'),
      extName: ".html",
    }
    transporter.use('compile', hbs(handlebarOptions))
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error)
        console.log("Server not ready")
      } else {
        console.log("Server is ready to take our messages")
      }
    })
  
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error)
      } else {
        console.log("Email sent: " + info.response)
      }
    })
  }
  
  export async function confirmationOTP(req,res) {
      const user = await User.findOne({ otp: req.body.otp })
        if (user) {
            res.status(200).json({"message" : "success"})
        } else {
          res.status(400).json({"error": "error"})
        }
  }

  export async function confirmationOTP1(req,res) {
    const user = await User.findOne({ email: req.body.email ,otp: req.body.otp })
      if (user) {
          res.status(200).json({"message" : "success"})
      } else {
        res.status(400).json({"error": "error"})
      }
}
  export async function resetPassword(req,res) {
    const email = req.body.email
    const newPass = req.body.newPass
    console.log("newPass = ",newPass)
    const otp = req.body.otp
    const user = await User.findOne({ email: email ,otp: otp })
      if (user) {
          user.password = await bcrypt.hash(newPass, 10)
          user.save().then(() => {
            res.status(200).json({"message": "user password changed"})
          }).catch(() => {
            res.status(400).json({"error": "error"})
          })
      } else {
        res.status(400).json({"error": "error"})
      }
  }


  ///// FUNCTIONS ---------------------------------------------------------

function generateUserToken(user) {
    return jwt.sign({ user }, process.env.JWT_SECRET, {
      expiresIn: "100000000",// in Milliseconds (3600000 = 1 hour)
    })
  }

  const sendEmailtest = (email,otp)=>{
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'savysy22@gmail.com',
        pass: 'elakojhhgycdbwuq' //Savy12345
      }
    });
    
    const mailOptions = {
      from: 'savysy22@gmail.com',
      to: email,
      subject: 'Verification du compte',
      text: `Email content : ${otp}`
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
     console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
        // do something useful
      }
    });
  }

/*
  async function sendOTP(email, codeDeReinit) {
    sendEmail({
     // from: process.env.GMAIL_USER,
      from: "aziza.taboubi@esprit.tn",
      to: email,
      // to: "azizataboub99@gmail.com",
      subject: "Password reset",
      html:
        "<h3>You have requested to reset your password</h3><p>Your reset code is : <b style='color : green'>" +
        codeDeReinit +
        "</b></p>",
    })
  }

function sendEmail(mailOptions) {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "aziza.taboubi@esprit.tn",
        pass: "grayfullbustergray",
      },
    })
  
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error)
        console.log("Server not ready")
      } else {
        console.log("Server is ready to take our messages")
      }
    })
  
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error)
      } else {
        console.log("Email sent: " + info.response)
      }
    })
  }*/
  
  