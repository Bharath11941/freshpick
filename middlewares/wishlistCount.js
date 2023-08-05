const User = require("../models/userModel");

const wishlistCount = async (req,res,next) => {
  try {
    if(req.session.user){
      const {userId} = req.session
      const user = await User.findOne({_id:userId})
      if(user){
        let length = user.wishlist.length
        res.locals.wcount = length
        const {wcount} = res.locals
        next()
      }else{
        res.locals.wcount = 0
        const {wcount} = res.locals
        next()
      }
    }else{
      res.locals.count = 0
        const {wcount} = res.locals
        next()
    }
  } catch (error) {
    console.log(error.message);
  }
}
module.exports = wishlistCount