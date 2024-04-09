import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    name:{
        type:String,
        required: [true, "Please provide a product name"],
        trim: true,
        maxLength: [50, "Product name should be a max of 50 characters"]
    },
    price:{
        type:Number,
        required: [true, "Please attach price to your product"],
        maxLength: [7, "Product price should not be more than 7 digits"]
    },
    description:{
        type: String,
        required:[true, "Please add a description to your product"],
        maxLength: [200," Product description should not be more than 200 characters"]
    },
    photos:[
        {
         secure_url: {
            type: String,
            required: true
            },
            public_id:{
                type: String,
                required: true
            }
        }
    ],
    stock:{
        type: Number,
        default: 0
    },
    sold: {
        type: Number,
        default: 0
    },

    coupon:[
        {
            type: mongoose.Types.ObjectId,
            ref: "Coupon"
        }
    ],

    categories:{
        type: String,
       required: [true, "Please provide at least one category for the product"]
    },
},
{timestamps: true}
)
export default mongoose.model("Product", ProductSchema)