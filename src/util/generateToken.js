import  jwt  from "jsonwebtoken";
import { config } from "dotenv";
config()

const generateToken = (id) => {
    return jwt.sign({
        id
    },
    process.env.JWT_SECRET, 
    {
    expiresIn: "24h"
    }
    )
};
export default generateToken;