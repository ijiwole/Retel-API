import express from 'express';
import { createOrder } from '../controller/order.js';


const orderRouter = express.Router()

orderRouter.route("/create").post(createOrder)

export default orderRouter;