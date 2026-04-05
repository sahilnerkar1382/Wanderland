const express = require('express');
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedin, isOwner, validateListing } = require("../middleware.js");
const ListingController = require("../controllers/listings.js");

const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
.route("/")
.get(wrapAsync(ListingController.index))
.post(
  isLoggedin,
  upload.single("listing[image]"),   // FIXED
  validateListing,
  wrapAsync(ListingController.createListing)
)

router.get("/new", isLoggedin, ListingController.rendernewform);

router
.route("/:id")
.get(wrapAsync(ListingController.showListing))
.put(
  isLoggedin,
  isOwner,
  upload.single("listing[image]"),   // FIXED
  validateListing,
  wrapAsync(ListingController.updateListing)
)
.delete(
  isLoggedin,
  isOwner,
  wrapAsync(ListingController.DeleteListing)
);

router.get(
  "/:id/edit",
  isLoggedin,
  isOwner,
  wrapAsync(ListingController.renderEditForm)
);

module.exports = router;