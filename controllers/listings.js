import * as maptilerClient from "@maptiler/client";
import Listing from "../models/listing.js";

//  SET API KEY (VERY IMPORTANT)
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

// ================= INDEX =================
export const index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

// ================= NEW FORM =================
export const rendernewform = (req, res) => {
  res.render("listings/new.ejs");
};

// ================= SHOW =================
export const showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

// ================= CREATE =================
export const createListing = async (req, res, next) => {
  try {
    const location = req.body.listing?.location?.trim();

    // ✅ 1. Check empty location
    if (!location) {
      req.flash("error", "Location is required");
      return res.redirect("/listings/new");
    }

    // ✅ 2. Call MapTiler correctly
    const response = await maptilerClient.geocoding.forward(location, {
      limit: 1,
    });

    console.log("MAP RESPONSE:", response); // 🔥 DEBUG

    // ✅ 3. Safe check
    if (!response || !response.features || response.features.length === 0) {
      req.flash("error", "Invalid location");
      return res.redirect("/listings/new");
    }

    const coordinates = response.features[0]?.geometry?.coordinates;

    // ✅ 4. DOUBLE safety
    if (!coordinates) {
      req.flash("error", "Could not fetch coordinates");
      return res.redirect("/listings/new");
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    newListing.geometry = {
      type: "Point",
      coordinates: coordinates,
    };

    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    await newListing.save();

    req.flash("success", "Successfully created a new listing");
    res.redirect("/listings");

  } catch (err) {
    console.error("❌ ERROR:", err);
    next(err);
  }
};

// ================= EDIT =================
export const renderEditForm = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image?.url || "";
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// ================= UPDATE =================
export const updateListing = async (req, res) => {
  const { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true, runValidators: true }
  );

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await listing.save();
  }

  req.flash("success", "Successfully updated the listing");
  res.redirect(`/listings/${id}`);
};

// ================= DELETE =================
export const deleteListing = async (req, res) => {
  const { id } = req.params;

  const deleted = await Listing.findByIdAndDelete(id);

  if (!deleted) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  req.flash("success", "Successfully deleted the listing");
  res.redirect("/listings");
};