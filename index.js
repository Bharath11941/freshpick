const express = require("express");
const app = express();
const noCache = require("./middlewares/cache");
const cartCount = require("./middlewares/cartCount");
const wishlistCount = require("./middlewares/wishlistCount");
const localSession = require("./middlewares/userSession");

//remove cache
app.use(noCache);
app.set("view engine", "ejs");
//session
const session = require("express-session");
app.use(session({ secret: "key", saveUninitialized: true, resave: false }));
app.use(localSession.commonNav);
app.use(cartCount);
app.use(wishlistCount)
//error 404
const Error404 = require('./middlewares/error')
// app.use(Error404)



//for database connection
require("dotenv").config();
const dbconnect = require("./config/db_connection");
dbconnect.dbconnect();

//for user routes
const userRoute = require("./routes/userRoute");
app.use("/", userRoute);

//for admin routes
const adminRoute = require("./routes/adminRoute");
app.use("/admin", adminRoute);

//for static files
app.use(express.static(__dirname + "/public/userAssets"));
app.use(express.static(__dirname + "/public/adminAssets"));
app.use(express.static(__dirname + "/public"));

app.listen(5000, () => {
  console.log(`Server running on port http://localhost:5000`);
});
