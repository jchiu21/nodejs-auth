const cloudinary = require("../config/cloudinary")

const uploadToCloudinary = async(filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath);
    return {
      url: result.secure_url, // for displaying/using the image
      publicId: result.public_id // for managing the image
    }

  } catch (error) {
    console.error("Error while uploading to cloudinary", error);
    throw new Error("Error while uploading to cloudinary")
  }
}

module.exports = {
  uploadToCloudinary
}