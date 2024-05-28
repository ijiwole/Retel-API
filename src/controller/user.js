import UserSchema from "../models/user.js";
import { StatusCodes } from "http-status-codes";
import AuthRoles from "../util/authRoles.js";
import validateEmail from "../util/emailValidator.js";
import bcyrpt from "bcryptjs";
import sendMail from "../util/mailHelper.js";
import generateToken from "../util/generateToken.js";
import cloudinary from "../util/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

export const cookieOptions = {
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  httpOnly: true,
};

const cloud_storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile",
    allowedFormats: ["JPG, PNG, JPEG"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

export const upload = multer({ storage: cloud_storage });

// User Registration
export const register = async (req, res) => {
  try {
    const { name, email, password, confirm_password, role } = req.body;

    if (!name || !email || !password || !confirm_password || !role) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Please fill in all required fields",
        status: StatusCodes.BAD_REQUEST,
      });
    }

    if (password != confirm_password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Oops!, Password not Match",
        status: StatusCodes.BAD_REQUEST,
      });
    }

    if (password.length < 8) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Password lenght must be more than 8 ",
        status: StatusCodes.BAD_REQUEST,
      });
    }

    if (!Object.values(AuthRoles).includes(role)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Invalid User Role",
        staus: StatusCodes.BAD_REQUEST,
      });
    }

    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    UserSchema.findOne({ email: email }).then((existingUser) => {
      if (existingUser) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          msg: "User already exists",
          status: StatusCodes.BAD_REQUEST,
        });
      } else {
        // create a new user
        const user = new UserSchema({
          name: name,
          email: email,
          password: password,
          otp: otp,
          role: role,
        });
        bcyrpt.genSalt(10, (err, salt) =>
          bcyrpt.hash(user.password, salt, (err, hash) => {
            if (err) throw err;

            user.password = hash;

            user.save().then(async (savedUser) => {
              sendMail(
                savedUser.email,
                "Retel Verification Email",
                `<p>Please use the otp below to verify your email address ${otp}, Note: please don't share this otp if you did not authorize account creation on Rete.</p>`
              );
              res.status(StatusCodes.CREATED).json({
                userId: savedUser._id,
                msg: "Account created successfully",
              });
            });
          })
        );
      }
    });
  } catch (err) {
    console.log(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: `${err}`,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

// Google registration
export const googleRegistration = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Fill in the name field",
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }

    if (!req.body.email) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Input your email", status: StatusCodes.BAD_REQUEST });
    }

    // if (!req.body.role) {
    //   return res
    //     .status(StatusCodes.BAD_REQUEST)
    //     .json({ msg: "Input your email", status: StatusCodes.BAD_REQUEST });
    // }
    // // validate roles
    // if (!Object.values(AuthRoles).includes(role)) {
    //   return res.status(StatusCodes.BAD_REQUEST).json({
    //     msg: "Invalid user role",
    //     status: StatusCodes.BAD_REQUEST,
    //   });
    // }

    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    UserSchema.findOne({ email: req.body.email }).then((existingUser) => {
      if (existingUser) {
        return res.status(StatusCodes.CREATED).json({
          msg: "login success",
          token: generateToken(existingUser),
          status: StatusCodes.CREATED,
        });
      } else {
        //create new user
        const user = new UserSchema({
          name: req.body.name,
          email: req.body.email,
          //role: req.body.role,
          otp: otp,
          verified: true,
          direct: true,
          img: {
            url: req.body.photo ?? "",
            publicId: "",
          },
        });
        user.save().then(async (savedUser) => {
          sendMail(
            savedUser.email,
            "Retel",
            `Welcome onboard ${savedUser.name}`
          );
          res.status(StatusCodes.CREATED).json({
            userId: savedUser._id,
            msg: "Account successfully created",
            status: StatusCodes.CREATED,
          });
        });
      }
    });
  } catch (err) {
    console.log(err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: `${err}`, status: StatusCodes.INTERNAL_SERVER_ERROR });
  }
};

// Image Uploading
export const uploadProfilePicture = async (req, res) => {
  try {
    const UserId = req.headers.id;

    const user = await UserSchema.findById(UserId);

    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "User not found ", status: StatusCodes.BAD_REQUEST });
    }
    if (!req.file.path) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "No file provided!", status: StatusCodes.BAD_REQUEST });
    }
    //upload the user image with cloudinary url
    user.img = {
      url: req.file.path,
      publicId: req.file.path.split("/").slice(7).join("/").split(".")[0],
    };

    await user.save();
    res.status(StatusCodes.OK).json({
      msg: `Image Upload Successfully`,
      data: user.img,
      status: StatusCodes.OK,
    });
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: `${err.msg}`,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

// Email verification
export const emailverificaton = async (req, res) => {
  try {
    const user = await UserSchema.findOne({ otp: req.body.otp });

    (user.verified = true),
      (user.otp = ""),
      user.save().then(() => {
        res.status(StatusCodes.OK).json({
          msg: `email verification successful`,
          status: StatusCodes.OK,
        });
      });
  } catch (err) {
    console.log(err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: err.msg, status: StatusCodes.INTERNAL_SERVER_ERROR });
  }
};

//Resend Otp
export const resendOtp = async (req, res) => {
  const user = await UserSchema.findOne({ email: req.body.email });

  const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
  user.otp = otp;
  user
    .save()
    .then(() => {
      sendMail(
        user.email,
        "Retel",
        `Use the otp below to verify your email address ${otp}`
      );
      res.status(StatusCodes.OK).json({
        msg: `sucessful`,
        status: StatusCodes.OK,
      });
    })
    .catch((err) => {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: err.msg, status: StatusCodes.INTERNAL_SERVER_ERROR });
    });
};

//Forget Password
export const forgetPassword = async (req, res) => {
  try {
    const owner = await UserSchema.findOne({ email: req.body.email });

    if (!owner) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        msg: "Email not registered", 
        status: StatusCodes.NOT_FOUND 
      });
    }

    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    owner.otp = otp;

    await owner.save();

    sendMail(
      owner.email,
      "Forget Password",
      `Please use the OTP below to reset your password: ${otp}`
    );

    return res.status(StatusCodes.OK).json({ 
      msg: "Email sent successfully", 
      status: StatusCodes.OK 
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      msg: "Internal server error", 
      status: StatusCodes.INTERNAL_SERVER_ERROR 
    });
  }
};

//Change Password
export const changePassword = async (req, res) => {
  try {
    const owner = await UserSchema.findOne({ otp: req.body.otp });

    if (!owner) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        msg: "OTP is incorrect", 
        status: StatusCodes.BAD_REQUEST 
      });
    }

    // Update user password
    const newPassword = req.body.password;

    const salt = await bcyrpt.genSalt(10);
    const hash = await bcyrpt.hash(newPassword, salt);

    owner.password = hash;
    await owner.save();

    sendMail(
      owner.email,
      "Retel",
      `Password reset for your account ${owner.email} has been completed`
    );

    res.status(StatusCodes.OK).json({ 
      msg: "Password reset successful", 
      status: StatusCodes.OK 
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      msg: "Unable to reset password", 
      status: StatusCodes.INTERNAL_SERVER_ERROR 
    });
  }
};


// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "email or password is missing",
        status: StatusCodes.BAD_REQUEST,
      });
    }
    validateEmail(res, email);

    const user = await UserSchema.findOne({ email : email})

    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "user not registered on retel",
        status: StatusCodes.BAD_REQUEST,
      });
    }

    if (user.direct) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "login successful",
        token: generateToken(user.id),
        status: StatusCodes.OK,
      });
    }
    
    //compare password
     bcyrpt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.log(err);
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ msg: err.msg, status: StatusCodes.BAD_REQUEST });
      }

      if (!user.verified) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          msg: "Please verify your email",
          status: StatusCodes.BAD_REQUEST,
        });
      }

      if (isMatch) {
        return res.status(StatusCodes.OK).json({
          msg: "login successful",
          token: generateToken(user.id),
          status: StatusCodes.OK,
        });
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({
          msg: "Incorrect Password Provided",
          success: true,
          status: StatusCodes.BAD_REQUEST,
        });
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: err.message,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

// Google Login
export const googleLogin = async (req, res) => {
  try {
    const { email } = req.body;

    validateEmail(res, email);

    const user = await UserSchema.findOne({ email });

    if (!user) {
      googleRegistration(req, res);
    }

    if (user.direct) {
      return res.status(StatusCodes.OK).json({
        msg: "login success",
        token: generateToken(user.id),
        status: StatusCodes.OK,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Internal server error",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

//Logout
export const logout = async (req, res) => {
  try {
    //clear token by setting its expiration to a past date
    res.cookie("token", "", {
      expires: new Date(0),
      httpOnly: true,
    });
    res.status(StatusCodes.OK).json({
      msg: "Logged Out",
      success: true,
      status: StatusCodes.OK,
    });
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: err.msg,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

// Get user profile
export const myProfile = async (req, res) => {
  const id = req.headers.id;

  const owner = await UserSchema.findById(id).select("-otp");

  if (!owner) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "User not found" });
  }

  return res.status(StatusCodes.ACCEPTED).json({
    data: owner,
    msg: "Profile fetched",
    status: StatusCodes.ACCEPTED,
  });
};

//Edit profile
export const editProfile = async (req, res) => {
  const UserId = req.headers.id;
  try {
    const owner = await UserSchema.findById(UserId);

    if (!owner) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: "User not found",
        status: StatusCodes.NOT_FOUND,
      });
    }
    owner.name = req.body.name ?? owner.name;
    owner.email = req.body.email ?? owner.email;
    //owner.password = req.body.password ?? owner.password;

    if (req.file) {
      owner.img.url = req.file.path;
      owner.img.publicId = req.file.filename;
    }

    await owner.save();

    return res.status(StatusCodes.ACCEPTED).json({
      msg: "Profile updated successfully",
      status: StatusCodes.ACCEPTED,
    });
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: " Unable to update profile ",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

export const deleteProfile = async (req, res) => {
  const id = req.headers.id;

  const owner = await UserSchema.findByIdAndDelete(id);

  if (!owner) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "User not found" });
  }

  return res.status(StatusCodes.OK).json({
    msg: "Profile Successfully deleted",
    status: StatusCodes.OK,
  });
};
