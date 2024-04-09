import { StatusCodes } from "http-status-codes";
import { CustomApiError } from "./custom-api.js";

export class NotFoundError extends CustomApiError{
    constructor(message){
        super(message);
        this.statusCodes = StatusCodes.NOT_FOUND
    }
}