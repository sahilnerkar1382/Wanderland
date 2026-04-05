// Import the whole library
import * as maptilerClient from '@maptiler/client';

// Or import only the bits you need
import {
  config,
  geocoding,
  geolocation,
  coordinates,
  data,
  staticMaps,
  elevation,
  math,
} from '@maptiler/client';

import Listing from "../models/listing.js"

// INDEX
export const index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

// NEW FORM
export const rendernewform = (req, res) => {
  return res.render("listings/new.ejs");
};

// SHOW
export const showListing = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" }
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }


 
  res.render("listings/show.ejs", { listing });
};

// CREATE
export const createListing = async (req, res, next) => {
  // in an async function, or as a 'thenable':
let coordinate = await maptilerClient.geocoding.forward({
  query: "New Delhi , India",
  limit : 1,
  })
  

  console.log(coordinate.body.features);
  res.send("Done!");
  const newListing = new Listing(req.body.listing);

  newListing.owner = req.user._id;

  // ✅ attach image properly
  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }
  await newListing.save();

  req.flash("success", "Successfully created a new listing");
  res.redirect("/listings");
};

// EDIT FORM
export const renderEditForm = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }
 let orignalImageUrl  = listing.image.url;
  orignalImageUrl = orignalImageUrl.replace("/upload", "/upload/h_300,w_250");

  res.render("listings/edit.ejs", { listing , orignalImageUrl });
};

// UPDATE
export const updateListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(id, {
    ...req.body.listing
  });

  // ✅ update image if new one uploaded
  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
    await listing.save();
  }

  req.flash("success", "Successfully updated the listing");
  res.redirect(`/listings/${id}`);   // FIXED
};

// DELETE
export const deleteListing = async (req, res) => {
  let { id } = req.params;

  await Listing.findByIdAndDelete(id);

  req.flash("success", "Successfully deleted the listing");
  res.redirect("/listings");
};