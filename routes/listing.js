const express = require('express');
const router = express.Router();

const Listing = require("../models/listing");

const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedin, isOwner, validateListing } = require("../middleware.js");
const ListingController = require("../controllers/listings.js");

const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


// ================= SEARCH ROUTE (🔥 MUST BE ABOVE :id) =================
router.get("/search", async (req, res) => {
  const { query } = req.query;

  const listings = await Listing.find({
    $or: [
      { location: { $regex: query, $options: "i" } },
      { title: { $regex: query, $options: "i" } }
    ]
  });

  res.render("listings/index.ejs", { allListings: listings });
});


// ================= CATEGORY =================
router.get("/category/:category", async (req, res) => {
  const listings = await Listing.find({
    category: { $regex: new RegExp("^" + req.params.category + "$", "i") }
  });

  res.render("listings/index.ejs", { allListings: listings });
});


// ================= MAIN ROUTES =================
router
.route("/")
.get(wrapAsync(ListingController.index))
.post(
  isLoggedin,
  upload.single("image"),
  validateListing,
  wrapAsync(ListingController.createListing)
);

router.get("/new", isLoggedin, ListingController.rendernewform);


// ⚠️ THIS MUST BE LAST (VERY IMPORTANT)
router
.route("/:id")
.get(wrapAsync(ListingController.showListing))
.put(
  isLoggedin,
  isOwner,
  upload.single("image"),
  validateListing,
  wrapAsync(ListingController.updateListing)
)
.delete(
  isLoggedin,
  isOwner,
  wrapAsync(ListingController.deleteListing)
);

router.get("/:id/edit", isLoggedin, isOwner, wrapAsync(ListingController.renderEditForm));

module.exports = router;