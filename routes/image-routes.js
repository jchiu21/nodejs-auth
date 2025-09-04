const express = require("express");
const authMiddleware = require("../middleware/auth-middleware");
const adminMiddleware = require("../middleware/admin-middleware");
const uploadMiddleware = require("../middleware/upload-middleware");
const {
  uploadImageController,
  fetchImagesController,
  deleteImageController,
} = require("../controllers/image-controller");

const router = express.Router();

router.get("/all", authMiddleware, fetchImagesController);
router.post(
  "/upload",
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.single("image"),
  uploadImageController
);
router.delete("/:id", authMiddleware, adminMiddleware, deleteImageController);

module.exports = router;
