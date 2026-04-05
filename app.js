if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");
const User = require("./models/users.js");

// ================= DATABASE =================

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

mongoose.connect(MONGO_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.log("❌ DB Error:", err));

// ================= VIEW ENGINE =================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// ================= MIDDLEWARE =================

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// 🔥 IMPORTANT for image access
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= SESSION =================

const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ================= PASSPORT =================

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ================= GLOBAL VARIABLES =================

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// ================= ROUTES =================

// Home
// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });

// Listings
app.use("/listings", listingRouter);

// Reviews
app.use("/listings/:id/reviews", reviewRouter);

// Users
app.use("/", userRouter);

// ================= 404 HANDLER (FIXED) =================

// 🔥 NO MORE "*" ERROR
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong!" } = err;
  console.log("❌ ERROR:", err);
  res.status(status).render("error.ejs", { message });
});

// ================= SERVER =================

app.listen(8080, () => {
  console.log("🚀 Server running on port 8080");
});