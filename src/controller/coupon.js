import UserSchema from "../models/user.js";
import CouponSchema from "../models/coupon.js";
import { StatusCodes } from "http-status-codes";
import AuthRoles from "../util/authRoles.js";

//Create coupon by Admin
export const createCoupon = async(req, res)=> {
    try {
        const updateCouponId = req.headers.id;
        
        const user = await UserSchema.findById(updateCouponId)

        if(!user || user.role != AuthRoles.ADMIN){
            return res.status(StatusCodes.UNAUTHORIZED)
            .json({
                msg: "User is not an Admin & not authorized to create Coupon",
                status: StatusCodes.UNAUTHORIZED
        });
        }
        const { code, discount} = req.body

        if(!code || !discount ){
            return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ 
                msg:  "Please provide both coupon code and discount",
                status: StatusCodes.BAD_REQUEST
            });
        }

        const coupon = new CouponSchema({ code, discount, active: true})

        await coupon.save();
        
        return res.status(StatusCodes.CREATED)
        .json({
            msg: "Coupon code created successfully",
            status: StatusCodes.CREATED,
            coupon: coupon
        })
    } catch (err) {
        console.log(err);
        next(err)
        // return res.status(StatusCodes.INSUFFICIENT_STORAGE).json({
        //     msg: "Unable to create coupon",
        //     status: StatusCodes.INTERNAL_SERVER_ERROR
        // });
    }
};

//Edit coupon by Admin
export const updateCoupon = async (req, res) => {
    try {

    const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
    if (!isValidObjectId(req.params.id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Invalid coupon ID",
        status: StatusCodes.BAD_REQUEST,
      });
    }
        const couponId = req.params.id;

        const updates = req.body;

        const userId = req.headers.id;

        const user = await UserSchema.findById(userId);

        if(!user || user.role !== AuthRoles.ADMIN){
            return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({
                msg: "User is not an Admin & not authorized to edit Coupon",
                status: StatusCodes.UNAUTHORIZED
            });
        }

        const updatedCoupon = await CouponSchema.findByIdAndUpdate(
            couponId,
            updates,
            {new: true}
        );

            if(!updatedCoupon){
                return res
                .status(StatusCodes.NOT_FOUND)
                .json({
                    msg: "Coupon does not exist",
                    status: StatusCodes.NOT_FOUND
                });
            }

            return res.status(StatusCodes.OK).json({
                msg: "Coupon updated successfully",
                status: StatusCodes.OK,
                coupon: updatedCoupon
            });

    } catch (err) {
        console.log(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: "Unable to edit coupon",
            status: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

//Delete coupon by Admin
export const deleteCoupon = async(req, res)=> {
    try {
    
    const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
    if (!isValidObjectId(req.params.id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Invalid coupon ID",
        status: StatusCodes.BAD_REQUEST,
      });
    }
        const couponId = req.params.id;

        const userId = req.headers.id;

        const user = await UserSchema.findById(userId)
        if(!user || user.role !== AuthRoles.ADMIN){
            return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({
                msg: "User is not an Admin & not authorized to edit Coupon",
                status: StatusCodes.UNAUTHORIZED
            })
        }

        const deletedCoupon = await CouponSchema.findByIdAndDelete(couponId)
        if(!deletedCoupon){
            return res
            .status(StatusCodes.NOT_FOUND)
            .json({
                msg: "Coupon does not exist",
                status: StatusCodes.NOT_FOUND
            })
        }   
            return res
            .status(StatusCodes.OK)
            .json({
             msg: "Coupon deleted Successfully",
                status: StatusCodes.OK
            })

    } catch (err) {
        console.log(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: "Unable to delete coupon",
            status: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
    
};

//Deactivate coupon
export const deactivateCoupon = async(req, res) => {
    try {
        const couponId = req.params.id;

        const userId = req.headers.id;

        const user = await UserSchema.findById(userId);

        if(!user || user.role != AuthRoles.ADMIN){
            return res.status(StatusCodes.UNAUTHORIZED)
            .json({ 
                msg: " User is not an Admin & not authorized to deactivate Coupon ",
                status: StatusCodes.UNAUTHORIZED
            });
        }

        const deactivatedCoupon = await CouponSchema.findByIdAndUpdate(
            couponId,
            {active: false},
            {new: true}
            )
            if(!deactivatedCoupon){
                return res.status(StatusCodes.NOT_FOUND)
                .json({
                    msg: "Coupon not found",
                    status: StatusCodes.NOT_FOUND
                });
            }

            return res.status(StatusCodes.OK)
            .json({
                msg: "Coupon successfully deactivated",
                status: StatusCodes.OK
            });
    } catch (err) {
        console.log(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: "Unable to deactivate coupon",
            status: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

// Get all coupons
export const getCoupons = async(req, res) => {
    try {
        const userId = req.headers.id;

        const user = await UserSchema.findById(userId)

        if(! user || user.role !== AuthRoles.ADMIN){
            return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({
                msg: "User is not an Admin & not authorized to get all coupons",
                status: StatusCodes.UNAUTHORIZED
            });
        }
        
        const coupons = await CouponSchema.find()
        if(!coupons || coupons.length == 0){
            return res
            .status(StatusCodes.NOT_FOUND)
            .json({
                msg: " Coupons not available ",
                status: StatusCodes.NOT_FOUND
            });
        }
        return res
        .status(StatusCodes.OK)
        .json({
            msg: "Here are the available coupons",
            status: StatusCodes.OK,
            coupons : coupons
        });
    } catch (err) {
        console.log(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: "Unable to deactivate coupon",
            status: StatusCodes.INTERNAL_SERVER_ERROR
        });   
    }
};