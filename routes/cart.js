const Cart = require("../models/Cart");
const Product = require("../models/Product")
const { 
    verifyToken, 
    verifyTokenAndAuthorization, 
    verifyTokenAndAdmin, 
} = require("./verifyToken");
const CryptoJS = require("crypto-js");

const router= require("express").Router();

router.post("/checkout/confirm/:userId",verifyToken,async (req,res)=>{
  try{
    const result = {}
    const data = req.body
    console.log("data ->",data)
    const cart = await Cart.findOne({ userId: req.params.userId });
    if(data.status && data.status === '00'){
      const merchant_id = data.merchantRequestId
      const checkout_id = data.checkoutRequestId
      result.cart = await Cart.findByIdAndUpdate(
        cart._id,
        {$set:{complete:true,merchant_id:merchant_id,checkout_id:checkout_id,due: new Date()}},
        {new:true}
      )
      result.message = "Cart updated"
      return res.status(200).json(result)
    }
    result.message = "Request invalid"
    return res.status(400).json(result)
  }catch(e){
    res.status(500).json(err);
  }
})

router.post("/checkout/:userId", verifyToken, async (req, res) => {
  try {
    const result = {}
    const cart = await Cart.findOne({ userId: req.params.userId });
    var total_price = 0
    var products = []
    for(var product of cart.products){
      const quantity = product.quantity
      product = await Product.findById(product.productId)
      total_price += product ? product.price : 0
      products.push(product ? product : null)
    }
    result.cart = cart
    result.products = products
    result.total_price = total_price
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json(err);
  }
});
//CREATE
router.post("/", verifyToken, async (req, res) => {
    const newCart = new Cart(req.body);

    try {
      const savedProduct = await newCart.save();
      res.status(200).json(savedProduct);
    } catch (err) {
      res.status(500).json(err);
    }
});

//UPDATE
router.put("/:id", verifyTokenAndAuthorization, async (req, res)=>{
    try {
        const updatedCart = await Cart.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).json(updatedCart);
      } catch (err) {
        res.status(500).json(err);
      }
});

//DELETE
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
      await Cart.findByIdAndDelete(req.params.id);
      res.status(200).json("Cart has been deleted...");
    } catch (err) {
      res.status(500).json(err);
    }
  });

  //GET USER CART
  router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
    try {
      const cart = await Cart.findOne({ userId: req.params.userId });
      res.status(200).json(cart);
    } catch (err) {
      res.status(500).json(err);
    }
  });

  //GET ALL
  router.get("/", verifyTokenAndAdmin, async (req, res) => {
    try {
      const carts = await Cart.find();
      res.status(200).json(carts);
    } catch (err) {
      res.status(500).json(err);
    }
  
  });
  
module.exports = router;