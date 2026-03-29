const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const Listing = require("../models/listing.js");
const  {isLoggedin , isOwner, validateListing}  = require("../middleware.js");
const { findById } = require('../models/reviews.js');
const ListingController = require("../controllers/listings.js");

router
.route("/")
.get( wrapAsync(ListingController.index))
.post(
  validateListing,
  isLoggedin,
   wrapAsync(ListingController.createListing)
);

router.get("/new", isLoggedin, ListingController.rendernewform);

router
.route("/:id")
.get( wrapAsync(ListingController.showListing))
.put(
  validateListing,
  isLoggedin,
  isOwner,
  wrapAsync(ListingController.updateListing))
.delete( isLoggedin,  isOwner,wrapAsync(ListingController.DeleteListing));



//Index Route


//New Route


//Show Route


//Create Route

//Edit Route
router.get("/:id/edit", isLoggedin, isOwner, wrapAsync(ListingController.renderEditForm));




 module.exports = router;
