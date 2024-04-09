import { StatusCodes } from "http-status-codes";

const errorHandlerMiddleware = (err, req, res, next) => {
    console.log(err)
    const CustomError ={
        statusCodes: err.statusCodes || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || "Someting went wrong, try again later"
    }
    
    if ( err.name === "ValidationError"){
        CustomError.statusCodes = 400,
            CustomError.msg = Object.value(err.errors).map((item) => item.message).join(",")
    }

    if( err.code == 'MongoServerError' && err.code === 11000){
        CustomError.statusCodes = 400,
            CustomError.msg = "Coupon code already exists"
            //`Duplicate value entered for ${Object.keys(err.keyValue)} field, please choose another value`
    }

    if(err.name === "CastError"){
        CustomError.statusCodes = 404,
            CustomError.msg = `No item found with the id ${err.value}`
    }

    return res
    .status(CustomError.statusCodes)
    .json({ msg: CustomError.msg })
};

export default errorHandlerMiddleware;