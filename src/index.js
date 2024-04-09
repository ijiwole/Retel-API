import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from 'dotenv';
import { connectDB } from "./config/connect.js";
import { upload } from "./controller/user.js";
import { upload2 } from "./controller/product.js";
import  userRouter  from "./routes/user.js";
import productRouter from "./routes/product.js";
import couponRouter from "./routes/coupon.js";
import notFoundError from "./middleware/notFoud.js";
import errorHandler from "./middleware/errorHandler.js"
config();

const app = express();



app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors()); 
app.use(cookieParser());


app.use(errorHandler);
app.use(notFoundError)

app.use("/api/user", upload.single("image"), userRouter)
app.use("/api/product", upload2.single("image"), productRouter)
app.use("/api/coupon", couponRouter)


const port = process.env.PORT || 9000;

const start = async () => {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is starting at port ${port}.....`)
    );
    //.......
  };
  
  start();
