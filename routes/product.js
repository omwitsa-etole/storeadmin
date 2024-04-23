const Product = require("../models/Product");
const Order = require("../models/Order");
const { 
    verifyToken, 
    verifyTokenAndAuthorization, 
    verifyTokenAndAdmin, 
} = require("./verifyToken");
const CryptoJS = require("crypto-js");

const router= require("express").Router();
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "admin/uploads/"); // Store uploaded files in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage });

//STATS
router.post("/stats", verifyTokenAndAdmin, async (req, res) => {
    try {
		
		const data = {}
		const date = new Date();
		const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
		const products = await Product.aggregate([
			{ $match: { createdAt: { $gte: lastYear } } },
			{
			  $project: {
				month: { $month: "$createdAt" },
				revenue: "$price",
			  },
			},
			{
			  $group: {
				_id: "$month",
				total: { $sum: 1 },
				revenue:{$sum:"$revenue"},
			  },
			},
		  ]);
        const orders = await Order.aggregate([
			{ $match: { createdAt: { $gte: lastYear } } },
			{
			  $project: {
				month: { $month: "$createdAt" },
				sales: "$amount",
			  },
			},
			{
			  $group: {
				_id: "$month",
				total: { $sum: 1 },
			    sales: {$sum:"$sales"},
			  },
			},
		  ]);
		  data.products = products
		  data.orders = orders
        res.status(200).json(data);
      } catch (err) {
        res.status(500).json(err);
      }
});

//CREATE
router.post("/new", verifyTokenAndAdmin, async (req, res) => {
	if(!req.body.title || !req.body.categories || !req.body.img){
		res.status(400).json("Mising required data...");
	}
	
    try {
		upload.single(req,"img",function(err,file){
			console.log(file)
		})
		const newProduct = new Product(req.body);
		newProduct.creator = req.user._id
        const savedProduct = await newProduct.save();
        res.status(200).json(savedProduct);
      } catch (err) {
		  console.log(err)
        res.status(500).json(err);
      }
});

//UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res)=>{
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).json(updatedProduct);
      } catch (err) {
        res.status(500).json(err);
      }
});

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
      await Product.findByIdAndDelete(req.params.id);
      res.status(200).json("Product has been deleted...");
    } catch (err) {
      res.status(500).json(err);
    }
  });

  //GET PRODUCT
router.get("/find/:id", async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      res.status(200).json(product);
    } catch (err) {
      res.status(500).json(err);
    }
  });

  //GET ALL PRODUCTS
  router.get("/", async (req, res) => {
    const qNew = req.query.new;
    const qCategory = req.query.category;
	const result = {}
    try {
      let products;
  
      if (qNew) {
        products = await Product.find().sort({ createdAt: -1 }).limit(5);
      } else if (qCategory) {
        products = await Product.find({
          categories: {
            $in: [qCategory],
          },
        });
      } else {
        products = await Product.find().sort({ createdAt: -1 });
      }
	  result.products = products
	  result.orders = []
	  let orders = await Order.find().sort({ createdAt: -1 });
	  for(var item of orders){
		  for(var i of item.products){
			  if(i.product){
				result.orders.push({product:i.product,sales:item.amount})  
			  }
		  }
	  }
      
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
module.exports = router;