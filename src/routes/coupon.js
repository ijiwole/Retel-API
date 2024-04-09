import express from "express";
import { protect_user } from "../middleware/protectUser.js";
import { createCoupon, deactivateCoupon, getCoupons, updateCoupon } from "../controller/coupon.js";

const couponRouter = express.Router()


couponRouter.route("/create").post(protect_user, createCoupon)
couponRouter.route("/update/:id").put(protect_user, updateCoupon)
couponRouter.route("/deactivate/:id").patch(protect_user, deactivateCoupon)
couponRouter.route("/get-all-coupons").get(protect_user, getCoupons)

export default couponRouter