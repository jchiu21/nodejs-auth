const Image = require("../models/Image");
const { uploadToCloudinary } = require("../helpers/cloudinary-helper");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

const uploadImageController = async (req, res) => {
  try {
    // check if file missing in req object
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required. Please upload an image.",
      });
    }
    // upload to cloudinary
    const { url, publicId } = await uploadToCloudinary(req.file.path);

    // store image url, public id and user id in database
    const uploadedImage = new Image({
      url,
      publicId,
      uploadedBy: req.userInfo.userId, // get this from access token
    });

    await uploadedImage.save();

    // delete the file from local storage
    fs.unlinkSync(req.file.path);
    res.status(201).json({
      success: true,
      message: "Image uploaded successfullty",
      image: uploadedImage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Something went wrong! Please try again",
    });
  }
};

const fetchImagesController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit; // how many images to skip
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const totalImages = await Image.countDocuments();
    const totalPages = await Math.ceil(totalImages / limit);

    const sortObj = {};
    sortObj[sortBy] = sortOrder; // createdAt: 1
    const images = await Image.find({}).sort(sortObj).skip(skip).limit(limit);

    if (images) {
      res.status(200).json({
        success: true,
        currentPage: page,
        totalPages: totalPages,
        totalImages: totalImages,
        data: images,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Something went wrong! Please try again",
    });
  }
};

const deleteImageController = async (req, res) => {
  try {
    const userId = req.userInfo.userId;
    const imageId = req.params.id;
    const image = await Image.findById(imageId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }
    // check if image is uploaded by user trying to delete it
    // use uploadedBy property
    if (image.uploadedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this image",
      });
    }

    // delete image from cloudinary storage first
    await cloudinary.uploader.destroy(image.publicId);

    // delete image from mongo database
    await Image.findByIdAndDelete(imageId);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Something went wrong! Please try again",
    });
  }
};

module.exports = {
  uploadImageController,
  fetchImagesController,
  deleteImageController,
};
