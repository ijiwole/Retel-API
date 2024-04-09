import { config } from "dotenv";
import UserSchema from "../models/user.js";
import jwt from "jsonwebtoken";
import CustomError from "../errors/index.js";
config()

export const protect_user = async(req, res, next) =>{
    let token;
    const auth = req.headers.authorization;
    if(!auth || !auth.startsWith("Bearer ")){
      throw new CustomError.BadRequestError("Invalid authorization format");
    } 

    token = auth.split(" ")[1];
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.headers = await UserSchema.findById(decode.id);

    next();
};


