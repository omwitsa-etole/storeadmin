const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const categoryRoute = require("./routes/category");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const moment = require("moment");
const properties = require("./properties.json")
const path = require('path');
const exphbs = require('express-handlebars');

const session = require('express-session');

const { 
    verifyToken, 
    verifyTokenAndAuthorization, 
    verifyTokenAndAdmin, 
} = require("./routes/verifyToken");

dotenv.config();

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set secure to true if using HTTPS
}));

const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}
app.use(cors(corsOptions));
mongoose
  .connect(properties.MONGO_URL)
  .then(() => console.log("DB Connection Successfull!"))
  .catch((err) => {
    console.log(err);
  });
  app.use(bodyParser.urlencoded({ extended: false }));

  app.use(express.json());
  app.use(bodyParser.json());
  
  app.set('views', path.join(__dirname, 'admin'));
	app.engine('.html', exphbs.engine({ extname: 'html'}));
	app.set('view engine', '.html');
  
  app.use("/api/auth", authRoute); 
  app.use("/api/users", userRoute);
  app.use("/api/products", productRoute);
  app.use("/api/categories", categoryRoute);
  app.use("/api/carts", cartRoute);
  app.use("/api/orders", orderRoute);
  app.get("/logout", async (req, res) => {
	  req.session = null
    res.redirect("/login")
  });
  app.get("/", verifyToken,async (req, res) => {
    res.render("vendordashboard",{user:req.session.user});
  });
  app.get("/superuser",verifyToken, async (req, res) => {
	  console.log(req.session.user)
    res.render("vendordashboard",{user:req.session.user});
  });
  app.get("/login", async (req, res) => {
    res.sendFile(path.join(__dirname,'admin/login.html'));
  });
  app.get("/register", async (req, res) => {
    res.sendFile(path.join(__dirname,'admin/register.html'));
  });
  app.get("/settings/company", async (req, res) => {
    res.sendFile(path.join(__dirname,'admin/settings/company/index.html'));
  });
  app.get("/products", async (req, res) => {
    res.sendFile(path.join(__dirname,'admin/products/index.html'));
  });
  app.get("/orders", async (req, res) => {
    res.sendFile(path.join(__dirname,'admin/orders/index.html'));
  });


  app.post("/stk", async (req, res) => {
    const phone = req.body.phone;
    const amount = req.body.amount;

    res.json({phone, amount})
  });
  
	app.get('/*', (req, res) => {
		try{
		res.sendFile(path.join(__dirname,'admin'+req.url.split("?")[0]));
	  }catch(e){console.log(e)}
	  
	})

app.listen(process.env.PORT || 80, () => {
    console.log("Backend server is running! localhost");
  });
   