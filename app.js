const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const user = require("./models/user.js");


//mongo url
// const MONGO_URL = "mongodb://127.0.0.1:27017/FlexVisit";
//mongo atlas cloud 
const dbUrl = process.env.ATLASDB_URL;


//path set up
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

//mongo cloud store 
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error",()=>{
  console.log("Error in Mongo Session Store", err);
});

const sessionOption = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};




//main function connection
main()
  .then(() => {
    console.log("Connected to the Database");
  })
  .catch((err) => {
    console.log(err);
  });
//main fuction declaration
async function main() {
  await mongoose.connect(dbUrl);
}

//Home path
// app.get("/", (req, res) => {
//   res.send("Im the Root .");
// });

//used express session
app.use(session(sessionOption));
app.use(flash());

//passport usese
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware for flash message
app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});


//connect to routes folder
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);



//default express error message code
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found..!"));
});

//error route
app.use((err, req, res, next) => {
  let { status = 500, message = "Something Went wrong..!" } = err;
  res.status(status).render("error.ejs", { err });
  // res.status(status).send(message);
});

app.listen(8080, () => {
  console.log("Server is listening on Port 8080.");
});
