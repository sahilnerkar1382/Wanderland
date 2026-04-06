const Listing = require("./models/listing.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/reviews");

// ================= AUTH CHECK =================
module.exports.isLoggedin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to Wanderlust");
    return res.redirect("/login");
  }
  next();
};

// ================= SAVE REDIRECT =================
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// ================= OWNER CHECK =================
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  // ✅ safety check
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // ❗ FIX: check user exists
  if (!req.user || !listing.owner.equals(req.user._id)) {
    req.flash("error", "You are not the owner of the listing");

    // ❗ FIX: template string
    return res.redirect(`/listings/${id}`);
  }

  next();
};

// ================= VALIDATE LISTING =================
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);

  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// ================= VALIDATE REVIEW =================
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// ================= REVIEW AUTHOR CHECK =================
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;

  const review = await Review.findById(reviewId);

  // ✅ safety check
  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/listings/${id}`);
  }

  // ❗ FIX: use req.user (not res.locals)
  if (!req.user || !review.author.equals(req.user._id)) {
    req.flash("error", "You are not the author of the review");

    // ❗ FIX: template string
    return res.redirect(`/listings/${id}`);
  }

  next();
};