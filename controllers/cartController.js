const User = require("../models/userModel");
const Product = require("../models/productModel");

const cartLoad = async (req, res) => {
  try {
    const userData = await User.findOne({ email: req.session.user }).populate(
      "cart.productId"
    );
    res.render("cart", { userCart: userData.cart, userData });
  } catch (error) {
    console.log(error.message);
  }
};

const addToCart = async (req, res) => {
  try {
    const { user } = req.session;
    const { productId, quantity, singlePrice,totalStock} = req.body;
    const userCart = await User.findOne({email:user,"cart.productId": productId},{ "cart.$": 1 })
    const total = quantity * singlePrice;
    if (userCart) {
      const cartQuantity = userCart.cart[0].quantity
      if(cartQuantity<totalStock){
        const existingProduct = await User.findOneAndUpdate(
          { email: user, "cart.productId": productId },
          {
            $inc: {
              "cart.$.quantity": parseInt(quantity),
              "cart.$.total": total,
              grandTotal: total,
            },
          }
        );
          res.status(200).json({ message: "Product added to cart" });
      }else{
        res.status(200).json({ cartMessage: "Out of stock" });
      }

      
      } else {
        let cartUpdate=await User.findOneAndUpdate(
          { email: user },
          {
            $push: { cart: { productId, quantity, total } },
            $inc: { grandTotal: total },
          },{new:true}
        );
        const count = cartUpdate.cart.length
        res.status(200).json({ message: "Product added to cart",count });
      }
  } catch (error) {
    console.log(error.message);
  }
};
const updateCart = async (req, res) => {
  try {
    const { user } = req.session;
    const { productId } = req.params;
    const { quantity, grandTotal } = req.body;
    const productData = await Product.findOne({ _id: productId });
    let price = productData.price * quantity;
    // Find the user document
    const updatedData = await User.findOneAndUpdate(
      { email: user, "cart.productId": productId },
      {
        $set: {
          "cart.$.quantity": quantity,
          "cart.$.total": price,
          grandTotal: grandTotal,
        },
      }
    );
    res.sendStatus(200);
  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);
  }
};
const deleteCart = async (req, res) => {
  try {
    const { user } = req.session;
    const { cartId } = req.body;

    // Remove the cart item from the user's cart
    const updatedData = await User.findOneAndUpdate(
      { email: user },
      { $pull: { cart: { _id: cartId } } },
      { new: true } // Return the updated document
    );

    // Calculate the updated grand total by aggregating the cart items
    const updatedGrandTotal = updatedData.cart.reduce(
      (total, item) => total + item.total,
      0
    );

    // Update the grand total in the database
    await User.updateOne({ email: user }, { grandTotal: updatedGrandTotal });
    const userCart = await User.findOne({ email: user });
    const length = userCart.cart.length;
    res.send({ success: true, grandTotal: updatedGrandTotal, cart: length });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ success: false, error: error.message });
  }
};

module.exports = {
  deleteCart,
  updateCart,
  cartLoad,
  addToCart,
};
