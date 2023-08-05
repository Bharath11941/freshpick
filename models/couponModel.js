const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;
const couponSchema = new mongoose.Schema({
  title:{
    type:String,
    required:true
  },
  couponCode:{
    type:String,
    required:true,
    unique: true,
  },
  discountAmount:{
    type:Number,
    required:true
  },
  minAmount:{
    type:Number,
    required:true
  },
  expiryDate:{
    type:Date,
  },
  status:{
    type:String,
    default:'Active'
  },
  userUsed:[{
    userId:{
        type:ObjectId,
        ref:'user'
    }
}]
},{timestamps:true})

module.exports = mongoose.model('coupon',couponSchema)