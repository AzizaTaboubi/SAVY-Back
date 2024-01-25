import express from 'express'
const router = express.Router()
import multer from 'multer'
import SharpMulter from 'sharp-multer'
const storage =  
 SharpMulter ({
              destination:(req, file, callback) =>callback(null, "uploads/"),
              imageOptions:{
               fileFormat: "jpg",
               quality: 80,
               resize: { width: 100, height: 100 },
                 }
           });
const upload  =  multer({ storage });

import * as productController from '../Controllers/productController.js'


router.post('/add_prod', upload.single('image'), productController.addNewProduct)
router.get('/produits',productController.getAll)
router.post('/update_prod', upload.single('image'),productController.UpdateProduct)
router.post('/delete_prod',productController.deletee)
router.get('/getByUserID/:userID',productController.getByUserID)
router.post('/serch_prod',productController.rechercherProduit)
router.get('/searchUserProd',productController.rechercheProduitOccasion)
router.get('/brands',productController.getBrandsOfAModel)
router.get('/:id', productController.getProductDetails)

export default router
