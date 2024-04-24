import express  from "express";
import { 
    register, 
    resendOtp, 
    forgetPassword, 
    googleRegistration, 
    uploadProfilePicture,
    emailverificaton, 
    changePassword, 
    login, 
    googleLogin, 
    logout, 
    myProfile,
    upload,
    editProfile,
}from "../controller/user.js"
import {protect_user} from "../middleware/protectUser.js"



const userRouter = express.Router()

userRouter.route("/create").post(register)
userRouter.route("/google").post(googleRegistration)
userRouter.route("/upload").post(protect_user, uploadProfilePicture)
userRouter.route("/verify").post(emailverificaton)
userRouter.route("/resend").post(resendOtp)
userRouter.route("/forget").post(forgetPassword)
userRouter.route("/change").post(changePassword)
userRouter.route("/login").post(login)
userRouter.route("/google_login").post(googleLogin)
userRouter.route("/logout").post(logout)
userRouter.route("/myprofile").get(protect_user, myProfile)
userRouter.route("/edit-profile", upload.single("image")).post(protect_user, editProfile)

export default userRouter 