const express = require('express');
const router = express.Router({ mergeParams: true });
const Review = require("../models/reviews.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { validateReview  , isLoggedin, isReviewAuthor} = require("../middleware.js");



router.post("/",
  isLoggedin,
  validateReview,
  wrapAsync(async(req, res) =>{
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
   newReview.author = req.user._id;
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();
  
  req.flash("success", "Successfully created a new review!");
  res.redirect(`/listings/${listing._id}`);
}));

// Delete Review route 
 router.delete("/:reviewId", isLoggedin, isReviewAuthor, wrapAsync(async(req,res)=>{
  let {id, reviewId} = req.params;
  await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted the review");
  res.redirect(`/listings/${id}`);
 }))

 module.exports = router;
