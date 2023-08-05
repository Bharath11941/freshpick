const Coupon = require("../models/couponModel");

const couponList = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.render("couponList", { coupons });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
const getAddCoupon = async (req, res) => {
  try {
    res.render("addCoupon");
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
const postAddCoupon = async (req, res) => {
  try {
    const { title, couponCode, discountAmount, minAmount, expiryDate } =
      req.body;
    const date = new Date();
    const coupon = new Coupon({
      title: title,
      couponCode: couponCode,
      discountAmount: discountAmount,
      minAmount: minAmount,
      expiryDate: expiryDate,
    });
    await coupon.save();
    res.redirect("/admin/couponList");
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
const editCoupon = async (req, res) => {
  try {
    const { id } = req.query;
    const coupon = await Coupon.findById({ _id: id });
    res.render("editCoupon", { coupon });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
const updateCoupon = async (req, res) => {
  try {
    const {
      title,
      couponCode,
      discountAmount,
      minAmount,
      expiryDate,
      expire,
      id,
    } = req.body;
    if (expire === "on") {
      await Coupon.findByIdAndUpdate(
        { _id: id },
        { $set: { status: "Expired" } }
      );
    } else {
      await Coupon.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            title: title,
            couponCode: couponCode,
            discountAmount: discountAmount,
            minAmount: minAmount,
            expiryDate: expiryDate,
          },
        }
      );
    }
    res.redirect("/admin/couponList");
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.query;
    const deletedCoupon = await Coupon.deleteOne({ _id: id });
    res.redirect("/admin/couponList");
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
module.exports = {
  postAddCoupon,
  getAddCoupon,
  updateCoupon,
  deleteCoupon,
  couponList,
  editCoupon,
};
