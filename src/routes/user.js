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
    deleteProfile
}from "../controller/user.js"
import {protect_user} from "../middleware/protectUser.js"



const userRouter = express.Router()

userRouter.route("/create").post(register)
userRouter.route("/google").post(googleRegistration)
userRouter.route("/upload").post(protect_user, uploadProfilePicture)
userRouter.route("/verify").post(emailverificaton)
userRouter.route("/resend").post(resendOtp)
userRouter.route("/forget").post(forgetPassword)
userRouter.route("/change-password").post(changePassword)
userRouter.route("/login").post(login)
userRouter.route("/google_login").post(googleLogin)
userRouter.route("/logout").post(logout)
userRouter.route("/my-profile").get(protect_user, myProfile)
userRouter.route("/delete-profile").post(protect_user, deleteProfile)
userRouter.route("/edit-profile", upload.single("image")).post(protect_user, editProfile)

export default userRouter 