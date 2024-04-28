const User = require("../models/User");
const Order = require("../models/Order");
const { 
    verifyToken, 
    verifyTokenAndAuthorization, 
    verifyTokenAndAdmin, 
} = require("./verifyToken");
const CryptoJS = require("crypto-js");

const router= require("express").Router();

//UPDATE
router.put("/:id", verifyTokenAndAuthorization, async (req, res)=>{
    if (req.body.password) {
        req.body.password = CryptoJS.AES.encrypt(
          req.body.password,
          process.env.PASS_SEC
        ).toString();
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).json(updatedUser);
      } catch (err) {
        res.status(500).json(err);
      }
});

router.post("/delete", verifyTokenAndAuthorization, async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.user._id,{$set:{active:false}});
      res.status(200).json("Account has been deactivated...");
    } catch (err) {
      res.status(500).json(err);
    }
 });
 
 router.post("/profile", verifyTokenAndAuthorization, async (req, res) => {
    try {
      const data = req.body
	  if(!data.name || !data.country || !data.year || !data.email || !data.category || !data.address || !data.code){
		 return res.status(400).json({message:"Missing required data"}) 
	  }
	  await User.findByIdAndUpdate(req.user._id,{$set:{profile:data}},{new:true});
      res.status(200).json("Account profile set..");
    } catch (err) {
      res.status(500).json(err);
    }
 });

//DELETE
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("User has been deleted...");
    } catch (err) {
      res.status(500).json(err);
    }
 });

  //GET USER
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      const { password, ...others } = user._doc;
      res.status(200).json(others);
    } catch (err) {
      res.status(500).json(err);
    }
  });

  //GET ALL USER
router.get("/", verifyTokenAndAdmin, async (req, res) => {
    const query = req.query.new;
    try {
      const users = query 
      ? await User.find().sort({ _id: -1 }).limit(5) 
      : await User.find();
      const sanitizedUsers = users.map(user => {
        const { password, ...others } = user._doc;
        return others;
      });

      res.status(200).json(sanitizedUsers);
    } catch (err) {
      res.status(500).json(err);
    }
  }); 

  //GET USER STATS
  router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
	const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    
	const data = {}
    try {
      const users = await User.aggregate([
        { $match: { createdAt: { $gte: lastYear } } },
        {
          $project: {
            month: { $month: "$createdAt" },
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: 1 },
          },
        },
      ]);
	  const orders = await Order.aggregate([
        { $match: { createdAt: { $gte: lastMonth } } },
        {
          $project: {
            month: { $month: "$createdAt" },
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: 1 },
          },
        },
      ]);
	  data.users = users
	  data.orders = orders
      res.status(200).json(data)
    } catch (err) {
      res.status(500).json(err);
    }
  });

  
module.exports = router;