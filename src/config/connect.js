import mongoose from "mongoose";

export const connectDB = async (url) => {
        console.log("Connected to DB");
    try {
        await mongoose.connect(url);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
};
