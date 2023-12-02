const User = require("../models/userModel");
const Product = require("../models/productModel");

const wishlistLoad = async (req, res) => {
  try {
    const { userId } = req.session;
    const wishlistData = await User.findById({ _id: userId }).populate(
      "wishlist.productId"
    );
    const wishlist = wishlistData.wishlist;
    res.render("wishlist", { wishlist });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
const addWishlist = async (req, res) => {
  try {
    const { userId } = req.session;
    const { productId } = req.body;
    const date = new Date()
      .toLocaleDateString("en-us", {
        weekday: "short",
        day: "numeric",
        year: "numeric",
        month: "short",
      })
      .replace(",", "");
    const existingProduct = await User.findOne({
      _id: userId,
      "wishlist.productId": productId,
    });
    if (!existingProduct) {
      console.log("hi form if");
     const userWishlist = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { wishlist: { productId, date } } },
        {new:true}
      );
      const count = userWishlist.wishlist.length
      console.log(count);
      res.status(200).json({ success: true ,count });
    } else {
      res.status(200).json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server error" });
  }
};
const deleteWishlistProduct = async (req, res) => {
  const { wishlistId } = req.body;
  const { userId } = req.session;
  const wishlistData = await User.findOneAndUpdate(
    { _id: userId },
    { $pull: { wishlist: { _id: wishlistId } } },
    {new:true}
  );
  res.status(200).json({ success: true, length: wishlistData.wishlist.length });
};

module.exports = {
  deleteWishlistProduct,
  wishlistLoad,
  addWishlist,
};

