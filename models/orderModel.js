const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const orderSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    ref: "user",
    required: true,
  },
  products: [
    {
      productId: {
        type: ObjectId,
        ref: "product",
        
      },
      quantity: {
        type: Number,
        
      },
      price: {
        type: Number,
        
      },
    },
  ],
  total:{
    type:Number,
    required:true
  },
  shipAddress: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    enum: ["ONLINE", "COD" ,"WALLET"],
    required: true,
  },
  walletAmountUsed:{
    type:Number,
    default:0
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  expectedDelivery: {
    type: Date,
  },
},{timestamps:true});

module.exports = mongoose.model("order", orderSchema);
