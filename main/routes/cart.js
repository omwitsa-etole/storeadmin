const Cart = require("../models/Cart");
const Product = require("../models/Product")
const { 
    verifyToken, 
    verifyTokenAndAuthorization, 
    verifyTokenAndAdmin, 
} = require("./verifyToken");
const CryptoJS = require("crypto-js");

const router= require("express").Router();

router.post("/checkout/confirm",verifyToken,async (req,res)=>{
  try{
    const result = {}
    const data = req.body
    console.log("data ->",data)
    const cart = await Cart.findOne({ userId: req.user.id });
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

router.post("/checkout", verifyToken, async (req, res) => {
  try {
    const result = {}
    const cart = await Cart.findOne({ userId: req.user.id });
    if(!cart){
        const newCart = new Cart();
        newCart.userId = req.user.id
        //newCart.products.push({productId:data.product,quantity:data.quantity})
        const savedProduct = await newCart.save();
    }
    var total_price = 0
    var products = []
    if(cart.products){
      for(var product of cart.products){
        const quantity = product.quantity
        product = await Product.findById(product.productId)
        if(!product){continue}
        total_price += product ? product.price : 0
        products.push(product ? product : null)
      }
    }
    
    result.cart = cart
    result.products = products
    result.total_price = total_price
    res.status(200).json(result);
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
});
//CREATE
router.post("/add", verifyToken, async (req, res) => {
    
    try {
      const data = req.body
      let quantity = req.body.quantity ? req.body.quantity : 1
      if(!data.product){
        res.status(400).json({message:"Missing required product"})
      }
      console.log(data)
      const cart = await Cart.findOne({userId:req.user.id})
      if(!cart){
        const newCart = new Cart();
        newCart.userId = req.user.id
        newCart.products = [{productId:data.product}]
        const savedProduct = await newCart.save();
        res.status(200).json(savedProduct);
      }else{
        let newdata = {productId:data.product};
        let productId = data.product
        const existingProduct = cart.products.find(
          (product) => product.productId === data.product
        );
        if (existingProduct) {
        
          existingProduct.quantity += quantity || 1;
        } else {
          
          cart.products.push({ productId, quantity: quantity || 1 });
        }
        await cart.save();
        res.status(200).json({cart,message:"Cart updated success"});
      }
      
    } catch (err) {
      console.log(err)
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