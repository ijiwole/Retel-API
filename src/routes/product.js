import express from "express";
import { 
    addProduct, 
    attachCouponToProduct, 
    filterProducts, 
    getAllProducts, 
    getProductById, 
    updateProduct,  
    updateProductPrice, 
    uploadProductPicture 
} from "../controller/product.js";
import { protect_user } from "../middleware/protectUser.js";

const productRouter = express.Router()

productRouter.route("/add").post(addProduct)
productRouter.route("/upload").post(protect_user, uploadProductPicture)
productRouter.route("/products").get(protect_user, getAllProducts)
productRouter.route("/filter").post(filterProducts)
productRouter.route("/single/:productId").get(protect_user, getProductById)
productRouter.route("/update/:productId").get(protect_user, updateProduct)
productRouter.route("/products/:productId/coupons/:couponId").post(protect_user, attachCouponToProduct)
productRouter.route("update_data/productId").patch(updateProductPrice)

export default  productRouter