const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  const categories = ["mountain", "Premium", "Trending", "Farm", "Mountain Cities", "Arctic", "Castle", "Pools", "Camping"];

  const updatedData = initData.data.map((obj) => ({
    ...obj,
    owner: "69c699e1054e24c23690b2c2",
    category: categories[Math.floor(Math.random() * categories.length)]
  }));

  await Listing.insertMany(updatedData);

  console.log("data was initialized");
};

main()
  .then(() => {
    console.log("connected to DB");
    return initDB(); //safe execution
  })
  .catch((err) => {
    console.log(err);
  });