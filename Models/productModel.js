import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import express from 'express'

const app = express()
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())

const {Schema, model} = mongoose;
//creer votre schema qui decrit a quoi ressemblera chaque doc
const productSchema = new Schema(
    {
        userID: {
            type: String,
            required: false,
        },
        nom: { 
            type: String,
            required: true,
        },
        prix: { 
            type: Number,
            required: true,
        },
        image: { 
           type: String,
           required: true,
             },

        promo: { 
            type: Number,
            required: false, 
            default: null,
        },
        
        etat: {type: String,
            enum: {
                values: ['Nouveau', 'Occasion','Etat neuf','Jamais servi'],
                message: '{VALUE} is not supported'
        } },

        marque: {
            type: String,
            required: true,
        },

        boutique: {
            type: String,
            required: false, 
        },

        annee: {
            type: Number,
            required: true, 
        },

        description: {
            type: String,
           required: false,
        },

        type: { 
            type: String,
            enum: {
                values: ['tablette', 'camera', 'console', 'desktop', 'mouse', 'audio', 'laptop', 'mobile', 'keyboard', 'smartwatch', 'tv', 'fridge', 'other'],
                message: '{VALUE} is not supported'
                 }
         },

         city: { 
            type: String,
            enum: {
                values: ['Ariana', 'Beja', 'Ben Arous', 'Bizerte', 'Gabes', 'audio', 'Gafsa', 'Jendouba', 'Kairouan', 'Kasserine', 'Kebili', 'Kef', 
                'Mahdia', 'Manouba', 'Medenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'],
                message: '{VALUE} is not supported'
                }
         },

         owner : {
            type : Schema.Types.ObjectId,
            ref: 'User',
            },
       
    },

    {
        timestamps: { currentTime: () => Date.now() },
    }
);

/**
 * creer notre model a partir du schema pour effectuer des actions CRUD sur nos doc et l'exporter
 */


export default model('Product', productSchema)