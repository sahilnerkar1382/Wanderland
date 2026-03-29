const express = require('express');
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { validateReview  , isLoggedin, isReviewAuthor} = require("../middleware.js");
const ReviewController = require("../controllers/reviews.js")


router.post("/",
  isLoggedin,
  validateReview,
  wrapAsync(ReviewController.createReview));

// Delete Review route 
 router.delete("/:reviewId", isLoggedin, isReviewAuthor, wrapAsync(ReviewController.destroyReview))

 module.exports = router;
