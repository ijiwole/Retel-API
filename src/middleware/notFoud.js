import { StatusCodes } from "http-status-codes";

const NotFound = (req, res) => 
res.status(StatusCodes.NOT_FOUND).send("Route Not Found")

export default NotFound