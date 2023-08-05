const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  title:{
    type:String,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  price:{
    type:Number,
    required:true
  },
  quantity:{
    type:Number,
    required:true,
    default:0
  },
  category:{
    type:mongoose.Types.ObjectId,
    ref:'category',
    requre:true
  },
  image: {
    type: Array,
    required: true,
  },
  status:{
    type:Boolean,
    default:true
  },
},{timestamps:true})

module.exports = mongoose.model('product',productSchema);