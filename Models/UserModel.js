import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import express from 'express'

const app = express()
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())

const {Schema, model} = mongoose;
//creer votre schema qui decrit a quoi ressemblera chaque doc
const userSchema = new Schema(
    {
      
        fullname: { 
            type: String,
            required: true, },
        
        profilepic: {type: String,
            required: false, },

        email: {
            type: String,
            required: true,},

        password: {
            type: String,
            required: true, },

        numTel: {
            type: String,
            required: true, },
        role: {
            type: String,
            default: 'ROLE_USER',
            default: 'ROLE_USER',
            enum: {
                values: ['ROLE_ADMIN', 'ROLE_USER'],
                message: '{VALUE} is not supported'
        }
        },

        isVerified: { type: Boolean },

        otp : {
            type : Number,
            default : '8989'
        },
        
        products : [{type : Schema.Types.ObjectId, ref: "Product"}]
    },

    {
        timestamps: { currentTime: () => Date.now() },
    }
);

/**
 * creer notre model a partir du schema pour effectuer des actions CRUD sur nos doc et l'exporter
 */


export default model('User', userSchema)