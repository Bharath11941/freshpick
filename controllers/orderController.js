const User = require("../models/userModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const Razorpay = require("razorpay");
const mongoose = require("mongoose");
const moment = require("moment");
require("dotenv").config();
var instance = new Razorpay({
  key_id: process.env.YOUR_KEY_ID,
  key_secret: process.env.YOUR_KEY_SECRET,
});

const checkoutLoad = async (req, res) => {
  try {
    const { user } = req.session;
    const currentDate = new Date()
    req.session.couponApplied = false;
    const availableCoupons = await Coupon.find({
      status: "Active",
      expiryDate: { $gt: new Date(currentDate) }
    });
    const userOrder = await User.findOne({ email: user }).populate(
      "cart.productId"
    );
    res.render("checkout", { userOrder, availableCoupons, moment });
  } catch (error) {
    res.render("500");
    console.log(error.message);
  }
};
const orderAddress = async (req, res) => {
  try {
    const email = req.session.user;
    const { name, housename, city, district, state, mobile, pincode } =
      req.body;
    const address = await User.updateOne(
      { email: email },
      {
        $push: {
          address: {
            name: name,
            housename: housename,
            city: city,
            district: district,
            state: state,
            mobile: mobile,
            pincode: pincode,
          },
        },
      }
    );
    res.redirect("/checkout");
  } catch (error) {
    res.render("500");
    console.log(error.message);
  }
};
const applyCoupon = async (req, res) => {
  try {
    const { userId } = req.session;
    const { couponCode, cartTotal } = req.body;
    const findCoupon = await Coupon.findOne({ couponCode: couponCode });
    if (findCoupon) {
      const minAmount = findCoupon.minAmount;
      const discountAmount = findCoupon.discountAmount;
      const currDate = new Date();
      const status = findCoupon.status;
      const expiryDate = findCoupon.expiryDate;
      let discountedTotal;
      if (cartTotal > minAmount) {
        if (currDate <= expiryDate && status !== "Expired") {
          const id = findCoupon._id;
          const couponUsed = await Coupon.findOne({
            _id: id,
            "userUsed.userId": userId,
          });
          if (couponUsed) {
            console.log("this coupon is already used");
            res.json({ usedCoupon: true });
          } else {
            if (req.session.couponApplied === false) {
              const updateCoupon = await Coupon.updateOne(
                { _id: id },
                { $push: { userUsed: { userId: userId } } }
              );
              discountedTotal = cartTotal - discountAmount;
              req.session.couponApplied = true;
              res.json({ applied: true, discountedTotal, discountAmount });
            } else {
              res.json({ onetime: true });
            }
          }
        } else {
          console.log("Coupon has expired");
          res.json({ expired: true });
        }
      } else {
        console.log(`you should purchase atleast ${cartTotal}`);
        res.json({ minAmounts: true, minAmount });
      }
    } else {
      console.log("coupon wrong");
      res.json({ wrongcp: true });
    }
  } catch (error) {
    res.render("500");
    console.log(error.message);
  }
};
const placeOrder = async (req, res) => {
  try {
    const { address, paymentMethod, grandTotal } = req.body;
    const { user } = req.session;
    const userData = await User.findOne({ email: user });
    const products = userData.cart.map((cartItem) => ({
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      price: cartItem.price,
    }));
    const status =
      paymentMethod === "COD" || paymentMethod === "WALLET"
        ? "Placed"
        : "Pending";
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 3);
    const order = new Order({
      user: userData._id,
      products: products,
      total: grandTotal,
      shipAddress: address,
      status: status,
      method: paymentMethod,
      date: new Date()
        .toLocaleDateString("en-us", {
          weekday: "short",
          day: "numeric",
          year: "numeric",
          month: "short",
        })
        .replace(",", ""),
      time: currentTime,
      expectedDelivery: expectedDeliveryDate.toDateString(),
    });
    await order.save();
    let orderId = order._id;
    let totalAmount = order.total;
    if (status == "Placed") {
      if (paymentMethod === "WALLET") {;
        await User.updateOne(
          { email: user },
          {
            $push: {
              walletHistory: {
                date: new Date(),
                amount: -grandTotal,
                description: "Order Payment using Wallet Amount",
              },
            },
            $inc: { wallet: -grandTotal },
          }
        );
        await Order.updateOne(
          { _id: orderId },
          { $set: { walletAmountUsed: grandTotal } }
        );
      }
      for (const cartItem of userData.cart) {
        await Product.updateOne(
          { _id: cartItem.productId },
          { $inc: { quantity: -cartItem.quantity } }
        );
      }
      await User.updateOne(
        { email: user },
        { $set: { cart: [], grandTotal: 0 } }
      );
      res.json({ codSuccess: true });
    } else {
      var options = {
        amount: totalAmount * 100,
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        res.json({ order });
      });
    }
  } catch (error) {
    res.render("500");
    console.log(error.message);
  }
};
const onlineVerifyPayment = async (req, res) => {
  try {
    const { userId } = req.session;
    let userData = await User.findById({ _id: userId });
    const details = req.body;
    const crypto = require("crypto");
    let hmac = crypto.createHmac("sha256", process.env.YOUR_KEY_SECRET);
    hmac.update(
      details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
    );
    hmac = hmac.digest("hex");
    if (hmac === details.payment.razorpay_signature) {
      await Order.findByIdAndUpdate(
        { _id: details.order.receipt },
        { $set: { paymentId: details.payment.razorpay_payment_id } }
      );
      await Order.findByIdAndUpdate(
        { _id: details.order.receipt },
        { $set: { status: "Placed" } }
      );
      for (const cartItem of userData.cart) {
        await Product.updateOne(
          { _id: cartItem.productId },
          { $inc: { quantity: -cartItem.quantity } }
        );
      }
      await User.updateOne(
        { _id: userId },
        { $set: { cart: [], grandTotal: 0 } }
      );
      res.json({ success: true });
    } else {
      await Order.deleteOne({ _id: details.order.receipt });
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
    res.json({ success: false });
  }
};

const orderConfirm = async (req, res) => {
  try {
    const { userId } = req.session;
    const order = await Order.findOne({ user: userId }).sort({ createdAt: -1 });
    res.render("orderSuccess", { order });
  } catch (error) {
    res.render("500");
    console.log(error.message);
  }
};

module.exports = {
  onlineVerifyPayment,
  checkoutLoad,
  orderAddress,
  orderConfirm,
  applyCoupon,
  placeOrder,
};
