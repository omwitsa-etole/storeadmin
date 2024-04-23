const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
{
    userId: { type: String , required:true },
    products: [
        {
            productId: {
                type: String,
            },
            quantity: {
                type: Number,
                default: 1,
            },
        },
    ],
    complete:{
        type:Boolean,
        default:false
    },
    merchant_id:{
        type:String,
        default:null
    },
    checkout_id:{
        type:String,
        default:null,
    },
    due:{
        type:Date,
        default:null
    },
},
{timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);