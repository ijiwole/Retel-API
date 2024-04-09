import ProductSchema from "../models/product.js";
import UserSchema from "../models/user.js";
import CouponSchema from "../models/coupon.js";
import AuthRoles from "../util/authRoles.js";
import { StatusCodes } from "http-status-codes";
import { formidable } from "formidable";
import cloudinary from "../util/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import mongoose from "mongoose";

const cloud_storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Product",
    allowedFormats: ["JPG, PNG, JPEG"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

export const upload2 = multer({ storage: cloud_storage });

// Add a Product
export const addProduct = async (req, res) => {
  const form = formidable({
    multiples: true,
    keepExtensions: true,
  });

  form.parse(req, async function (err, fields) {
    try {
      if (err) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          msg: err.msg,
          status: StatusCodes.BAD_REQUEST,
        });
      }

      // Check for required fields
      const requiredFields = ["name", "price", "description", "category"];
      for (const field of requiredFields) {
        if (!fields[field]) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            msg: `Please provide ${field}`,
            status: StatusCodes.BAD_REQUEST,
          });
        }
      }

      const userId = req.headers.id;

      const user = await UserSchema.findById(userId);

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          msg: "User does not exist",
          status: StatusCodes.NOT_FOUND,
        });
      }

      // Check if the category exists
      const existingCategory = await ProductSchema.findOne({
        categories: fields.categories,
      });
      if (!existingCategory) {
        const newCategory = new Category({ name: fields.category });
        await newCategory.save();
      }

      // Create a new product
      const product = new ProductSchema({
        name: fields.name,
        price: fields.price,
        description: fields.description,
        categories: fields.categories,
      });

      await product.save();
      return res.status(StatusCodes.CREATED).json({
        msg: "Product added successfully",
        status: StatusCodes.CREATED,
        product: product,
      });
    } catch (err) {
      console.log(err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        msg: err.msg,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  });
};

// Add product image
export const uploadProductPicture = async (req, res) => {
  try {
    const productId = new mongoose.Types.ObjectId().toHexString();
    if (!req.file.path) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "No file uploaded",
        status: StatusCodes.BAD_REQUEST,
      });
    }

    const product = await ProductSchema.findById(productId);

    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: "Product not found",
        status: StatusCodes.NOT_FOUND,
      });
    }
    const result = await cloudinary.uploader.upload(req.file.path);
    // Add the cloudinary url to product
    product.photos.push({
      secure_url: result.secure_url,
      public_id: result.public_id,
    });

    await product.save();

    return res.status(StatusCodes.OK).json({
      msg: "Product image uploaded successfully",
      status: StatusCodes.OK,
      product: product,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: err.msg, status: StatusCodes.INTERNAL_SERVER_ERROR });
  }
};

//Get all products
export const getAllProducts = async (req, res) => {
  try {
    const userId = req.headers.id;

    const user = await UserSchema.findById(userId);

    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "User not found",
        status: StatusCodes.BAD_REQUEST,
      });
    }

    const products = await ProductSchema.find();

    return res.status(StatusCodes.OK).json({
      msg: "Products retrieved successfully",
      status: StatusCodes.OK,
      products: products,
    });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Internal server error",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

//Filter products
export const filterProducts = async (req, res) => {
  try {
    let filter = {};

    // for price filter
    if (req.query.price) {
      const { min, max } = JSON.parse(req.query.price);
      filter.price = { $gte: min, $lte: max };
    }

    // for category filter
    if (req.query.categories) {
      filter.categories = req.query.categories;
    }

    const filteredProducts = await ProductSchema.find(filter);
    return res.status(StatusCodes.OK).json({
      msg: "Products filtered successfully",
      status: StatusCodes.OK,
      products: filteredProducts,
    });
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: err.msg,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

// Get one product
export const getProductById = async (req, res) => {
  try {
    if (!req.params.productId) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: "Product Id not provided",
        status: StatusCodes.NOT_FOUND,
      });
    }

    const userId = req.headers.id;

    const user = await UserSchema.findById(userId);

    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "User does not exist",
        status: StatusCodes.BAD_REQUEST,
      });
    }

    const singleProduct = await ProductSchema.findById(
      req.params.productId
    ).lean();
    console.log(singleProduct);

    if (!singleProduct) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: "Product not found",
        status: StatusCodes.NOT_FOUND,
      });
    }
    //Format response to remove ._id and ._v
    const { _id, __v, ...formattedProduct } = singleProduct;

    return res.status(StatusCodes.ACCEPTED).json({ data: formattedProduct });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Internal server error",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

//Edit product
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const updates = req.body;

    if (!productId) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: " Product ID not found",
        status: StatusCodes.NOT_FOUND,
      });
    }

    const userId = req.headers.id;

    const user = await UserSchema.findById(userId);
    if (!user || user.role !== AuthRoles.ADMIN) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: "User not permitted to edit product",
        status: StatusCodes.NOT_FOUND,
      });
    }

    const allowedUpdates = ["name", "price", "description", "category"];
    const isValidUpdate = Object.keys(updates).every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg:
          "Invalid update fields provided. Allowed updates: " +
          allowedUpdates.join(", "),
        status: StatusCodes.BAD_REQUEST,
      });
    }

    const updatedProduct = await ProductSchema.findByIdAndUpdate(
      productId,
      updates,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Invalid update data provided",
        status: StatusCodes.BAD_REQUEST,
      });
    }
    return res.status(StatusCodes.OK).json({
      msg: "Product updated successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to update product",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

//Attach coupon to a product
export const attachCouponToProduct = async (req, res) => {
  try {
    const { couponId, productId } = req.body;

    const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

    if (
      !couponId ||
      !isValidObjectId(couponId) ||
      !productId ||
      !isValidObjectId(productId)
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Invalid couponId or productId provided",
        status: StatusCodes.BAD_REQUEST,
      });
    }

    const userId = req.headers.id;
    const user = await UserSchema.findById(userId);

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: "User not found",
        status: StatusCodes.UNAUTHORIZED,
      });
    }

    const product = await ProductSchema.findById(productId);
    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: "Product not found",
        status: StatusCodes.NOT_FOUND,
      });
    }

    const coupon = await CouponSchema.findById(couponId);
    if (!coupon) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: "Coupon not found",
        status: StatusCodes.NOT_FOUND,
      });
    }

    // Attach the coupon to the product
    await ProductSchema.findByIdAndUpdate(
      objectId,
      { $addToSet: { coupons: couponId } },
      { new: true }
    );
    return res.status(StatusCodes.OK).json({
      msg: "Coupon attached to product successfully",
      status: StatusCodes.OK,
      product: product,
    });
  } catch (err) {
    console.error("Error attaching coupon to product:", err.message, {
      productId,
      couponId,
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Internal server error",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

//Update product data with discounted price
export const updateProductPrice = async (req, res) => {
  try {
    const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
      const discountAmount = (originalPrice * discountPercentage) / 100;
      return originalPrice - discountAmount;
    };
    const { productId, discountPercentage } = req.body;

    if (!productId || !discountPercentage) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        msg: "Missing required fields: productId or discountPercentage",
        status: StatusCodes.BAD_REQUEST,
      });
    }

    const product = await ProductSchema.findByIdAndUpdate(productId);
    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        msg: "Product not found",
        status: StatusCodes.NOT_FOUND,
      });
    }

    // Calculate discounted price
    const originalPrice = product.price;
    const discountedPrice = calculateDiscountedPrice(
      originalPrice,
      discountPercentage
    );

    product.discountedPrice = discountedPrice;
    await product.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      msg: "Product data updated successfully",
      product: product,
      status: StatusCodes.OK,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      msg: "Unable to update product data",
      error: error.message,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

//Delete product
export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    // validate product Id
    if (!productId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Missing required field: productId",
        success: false,
        status: StatusCodes.BAD_REQUEST,
      });
    }

    const userId = req.headers.id;

    const user = await UserSchema.findById(userId);

    if (!user || user.role !== AuthRoles.ADMIN) {
      return res.status(StatusCodes.FORBIDDEN).json({
        msg: "You does not have permission to delete products",
        status: StatusCodes.FORBIDDEN,
      });
    }
    const deletedProduct = await ProductSchema.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        msg: "Product not Found",
        status: StatusCodes.NOT_FOUND,
      });
    }
    return res.status(StatusCodes.OK).json({
      success: true,
      msg: "Product Deleted Successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Unable to delete Product",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
