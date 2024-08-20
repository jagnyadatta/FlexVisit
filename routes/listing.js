if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const flash = require("connect-flash");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

//router.route function for / path
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createPost)
  );

//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//router.route for /:id path
router
  .route("/:id")
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updatePost)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deletePost))
  .get(wrapAsync(listingController.showListing));

//Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.editPost)
);

module.exports = router;
