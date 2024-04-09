import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Name is required"],
        maxLenght: [30, "Name must be less than 30"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLenght: [8, "Password must be at least 8 characters"],
        select: false // This does not return the user password whenever you want to generate user
    },
    otp:{
        type: String,
    },
    img:{
        url: String,
        publicId: String
    },
    role:{
        type: String,
        enum: ["ADMIN", "MODERATOR", "USER"],
        default: "USER"
    },
    verified: {
        type: Boolean,
        default: false,
    },
    direct:{
        type: Boolean,
        default: false,
    },

},
 {
    timestamps: true
}
);

UserSchema.methods.comparePassword = async function (password){
    return await bcrypt.compare(password, this.password)
};

export default mongoose.model("User", UserSchema)