const User = require("../models/userModel");

const cartCount = async (req,res,next) => {
  try {
    if(req.session.user){
      const {userId} = req.session
      const user = await User.findOne({_id:userId})
      if(user){
        let length = user.cart.length
        res.locals.count = length
        const {count} = res.locals
        next()
      }else{
        res.locals.count = 0
        const {count} = res.locals
        next()
      }
    }else{
      res.locals.count = 0
        const {count} = res.locals
        next()
    }
  } catch (error) {
    console.log(error.message);
  }
}
module.exports = cartCount