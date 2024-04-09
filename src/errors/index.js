import { CustomApiError } from "./custom-api.js";
import { BadRequestError } from "./bad-requests.js";
import { NotFoundError } from "./not-found.js";
import { UnauthorizedErrror } from "./unauthorized.js";
import { UnauthenticatedError } from "./unauthenticated.js";

export default { 
    CustomApiError,
    BadRequestError,
    NotFoundError,
    UnauthorizedErrror,
    UnauthenticatedError
}