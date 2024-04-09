const checkValidEmail = (res, email) => {
    validateEmail = (email) => {
        const regex =  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(email);
    }

    if(!validateEmail(email)){
        res.status(401);
        throw new Error("Please enter a valid Email Address");
    }
};
export default checkValidEmail