const mongoose = require("mongoose");

const NewsletterSchema = new mongoose.Schema(
{
	creator:{type:String, required: true},
    email: {type: String , required:true},
    description:{type:String},
    reply:{type:Array,default:null},
	read: { type: Boolean,default:false },
    
},
{timestamps: true }
);

module.exports = mongoose.model("Newsletter", NewsletterSchema);