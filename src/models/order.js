import mongoose from 'mongoose';


const orderSchema = new mongoose.Schema({
    products: {
        type: [
            {
                productId:{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                count : Number,
                price: Number
            }
        ],
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },

    address: {
        type: String,
        required: true
    },

    phoneNumber: {
        type: Number,
        required: true
    },

    amount: {
        type: Number,
        example: "100.99",
        required: true
    },

    coupon: {
        type: String,
        enum: ["ORDERED", "SHIPPED", "DELIVERED", "CANCELLED"],
        default: "ORDERED"
    },

    paymentMode: {
        type: String,
        enum: ["CARD", "TRANSFER", "POS"],
        required: true
    }

})