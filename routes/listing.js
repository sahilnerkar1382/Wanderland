const express = require('express');
const router = express.Router();

const Listing = require("../models/listing");

const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedin, isOwner, validateListing } = require("../middleware.js");
const ListingController = require("../controllers/listings.js");

const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// ================= ROUTES =================

router
.route("/")
.get(wrapAsync(ListingController.index))
.post(
  isLoggedin,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(ListingController.createListing)
);

router.get("/new", isLoggedin, ListingController.rendernewform);

router
.route("/:id")
.get(wrapAsync(ListingController.showListing))
.put(
  isLoggedin,
  isOwner,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(ListingController.updateListing)
)
.delete(
  isLoggedin,
  isOwner,
  wrapAsync(ListingController.deleteListing)
);

router.get(
  "/:id/edit",
  isLoggedin,
  isOwner,
  wrapAsync(ListingController.renderEditForm)
);

//  CATEGORY FILTER (FIXED)
router.get("/category/:category", async (req, res) => {
  const { category } = req.params;
  const listings = await Listing.find({ category });

  res.render("listings/index.ejs", { allListings: listings }); //  FIXED
});

module.exports = router;