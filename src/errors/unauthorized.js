import { StatusCodes } from "http-status-codes";
import { CustomApiError } from "./custom-api.js";

export class UnauthorizedErrror extends CustomApiError{
    constructor(message){
        super(message);
        this.statuscodes = StatusCodes.FORBIDDEN
    }
}