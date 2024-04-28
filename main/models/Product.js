const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
{
	creator:{type:String, required: true},
    title: {type: String , required:true, unique:true },
    desc: {type:String, required: true, },
    img: { type: String, required: true },
    categories: { type: Array,default:null },
    size: { type: String, }, 
    color: { type: String, },
    price: { type: Number, required: true },
    units:{type:Number,default:1},
},
{timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);