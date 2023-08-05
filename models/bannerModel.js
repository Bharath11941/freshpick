const mongoose = require('mongoose')
const bannerSchema = new mongoose.Schema({
  title:{
    type:String
  },
  description:{
    type:String
  },
  image:{
    type:Array,
    required:true
  },
  status:{
    type:Boolean,
    default:true
  }
},{timestamps:true})
module.exports = mongoose.model('banner',bannerSchema)