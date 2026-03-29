const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const Listing = require("../models/listing.js");
const  {isLoggedin , isOwner, validateListing}  = require("../middleware.js");
const { findById } = require('../models/reviews.js');








//Index Route
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});

  res.render("listings/index.ejs", { allListings });
}));

//New Route
router.get("/new", isLoggedin, (req, res) => {
 return res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate({path:
    "reviews",
    populate : {
      path : "author"
    }
  }).populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
}));

//Create Route
router.post(
  "/",
  validateListing,
  isLoggedin,
   wrapAsync(async (req, res,next) => {
 
     const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
  await newListing.save();
   req.flash("success", "Successfully created a new listing");
  res.redirect("/listings");

})
);

//Edit Route
router.get("/:id/edit", isLoggedin, isOwner, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id",
  validateListing,
  isLoggedin,
  isOwner,
  wrapAsync(async (req, res) => {
  let { id } = req.params;

  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", "Successfully updated the listing");
  res.redirect(`/listings/${id}`);
}));  

//Delete Route
router.delete("/:id", isLoggedin,  isOwner,wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Successfully deleted the listing");
  res.redirect("/listings");
}));



 module.exports = router;
