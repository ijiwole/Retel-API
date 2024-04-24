import { StatusCodes } from "http-status-codes";

const checkValidEmail = ( res, email) => {
   const validateEmail = (email) => {
        const regex =  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(email);
    }
    
    if(!validateEmail(email)){
       return res.status(StatusCodes.BAD_REQUEST).json({
            message:"Please enter a valid Email Address"
        });
        
    }
};

export default checkValidEmail