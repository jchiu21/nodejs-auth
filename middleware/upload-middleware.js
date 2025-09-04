const multer = require("multer");
const path = require("path");

// Purpose: handles file upload processing
// Configure multer, sets storage options, validates file

// set multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // where we are saving the file temporarily
    cb(null, "uploads/"); // save to uploads/ folder
  },
  filename: function (req, file, cb) {
    cb(
      null, // no error
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    ); // Example: "avatar-1428924.jpg", unique filename
  },
});

// check if uploaded file is actually an image file
const checkFileFilter = (req, file, cb) => {
  // e.g. MIME type: image/jpeg
  if (file.mimetype.startsWith("image")) {
    cb(null, true)
  } else {
    cb(new Error("Not an image! Please upload only images"))
  }
}

// export a configured multer instance
module.exports = multer({
  storage: storage,
  fileFilter: checkFileFilter,
  limits: {
    fileSize: 5 *1024 *1024 // 5mb file size limit
  }
})