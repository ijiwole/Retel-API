import ProductSchema from "../models/product.js";
import OrderSchema from "../models/order.js";
import CouponSchema from "../models/coupon.js";
import UserSchema from "../models/user.js";
import { StatusCodes } from "http-status-codes";


// create Order
export const createOrder = async (req, res) => {
    try {
        const userId = req.headers.id;

        const user = await UserSchema.findById(userId);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                msg: "User not found in the DB",
                status: StatusCodes.NOT_FOUND
            });
        }

        const { products, couponCode, address, phoneNumber } = req.body;


        if(!address || !phoneNumber){
            return res.status(StatusCodes.BAD_REQUEST).json({
                msg: "Phone Number and Address is required",
                status: StatusCodes.BAD_REQUEST
            });
        }
        // Fetch products from the database and calculate total amount
        let totalAmount = 0;
        const productsInOrder = [];
        for (const product of products) {
            const productData = await ProductSchema.findById(product.productId);
            if (!productData) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    msg: `Product with ID ${product.productId} not found`,
                    status: StatusCodes.BAD_REQUEST
                });
            }
            totalAmount += productData.price * product.quantity;
            productsInOrder.push({
                productId: productData._id,
                name: productData.name,
                price: productData.price,
                quantity: product.quantity
            });
        }

        // Apply coupon if provided
        let discountedAmount = totalAmount;
        if (couponCode) {
            const coupon = await CouponSchema.findOne({ code: couponCode });
            if (coupon) {
                discountedAmount = totalAmount - (totalAmount * coupon.discount / 100);
            } else {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    msg: "Invalid coupon code",
                    status: StatusCodes.BAD_REQUEST
                });
            }
        }

        // Create the order
        const newOrder = new OrderSchema({
            userId,
            products: productsInOrder,
            totalAmount: discountedAmount,
            couponApplied: couponCode ? true : false,
            status: 'pending' // Initial status
        });

        // Save the order to the database
        await newOrder.save();

        return res.status(StatusCodes.CREATED).json({
            msg: "Order created successfully",
            order: newOrder,
            status: StatusCodes.CREATED
        });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: "Unable to create an order",
            status: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

// make order payment
