const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const moment = require("moment");
require("dotenv").config();
const CONTENTS_PER_PAGE = 5;
const SALES_PER_PAGE = 10;
let admin = {
  email: process.env.EMAIL_ADMIN,
  password: process.env.ADMIN_PASSWORD,
};

const adminLogin = async (req, res) => {
  try {
    res.render("adminLogin");
  } catch (error) {
    console.log(error.message);
  }
};
const adminVerifyLogin = async (req, res) => {
  try {
    let { email, password } = req.sanitisedData;
    if (admin.email === email) {
      if (admin.password === password) {
        req.session.admin = email;
        res.redirect("/admin/dashboard");
      } else {
        res.render("adminLogin", { errMessage: "Password is incorrect" });
      }
    } else {
      res.render("adminLogin", { errMessage: "email is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const loadDashboard = async (req, res) => {
  try {
    const ordersCount = await Order.countDocuments();
    const productsCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();
    const placedCount = await Order.find({ status: "Placed" }).count();
    const deliveredCount = await Order.find({ status: "Delivered" }).count();
    const cancelledCount = await Order.find({ status: "Cancelled" }).count();
    const orderData = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user")
      .populate("products.productId")
      .exec();
    let currentDate = new Date();
    currentDate.setHours(0);
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);
    let todayRevenue = await Order.aggregate([
      {
        $match: {
          status: { $ne: "Cancelled" },
          createdAt: { $gte: currentDate },
        },
      },
      {
        $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } },
      },
    ]);
    if (todayRevenue.length === 0) {
      todayRevenue.push({ _id: null, total: 0, count: 0 });
    }
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const endOfWeek = new Date(currentDate);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const currentWeekRevenue = await Order.aggregate([
      {
        $match: {
          status: { $ne: "Cancelled" },
          createdAt: { $gte: startOfWeek, $lte: endOfWeek },
        },
      },
      {
        $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } },
      },
    ]);
    if (currentWeekRevenue.length === 0) {
      currentWeekRevenue.push({ _id: null, total: 0, count: 0 });
    }
    // const toda
    const totalRevenue = await Order.aggregate([
      {
        $match: { status: { $ne: "Cancelled" } },
      },
      {
        $group: { _id: null, total: { $sum: "$total" } },
      },
    ]);
    if (totalRevenue.length === 0) {
      totalRevenue.push({ _id: null, total: 0 });
    }
    const currentMonth = new Date().getMonth() + 1; // Get the current month (1-12)
    const earnings = await Order.aggregate([
      {
        $match: {
          status: { $ne: "Cancelled" },
          $expr: { $eq: [{ $month: "$createdAt" }, currentMonth] },
        },
      },
      {
        $group: {
          _id: null,
          monthlyEarnings: { $sum: "$total" },
        },
      },
    ]);
    if (earnings.length === 0) {
      earnings.push({ _id: null, monthlyEarnings: 0, });
    }
    let sales = [];
    let users = [];
    let date = new Date();
    let year = date.getFullYear();
    let currentYear = new Date(year, 0, 1);
    let salesByYear = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: currentYear },
          status: { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%m", date: "$createdAt" } },
          total: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    for (let i = 1; i <= 12; i++) {
      let result = true;
      for (let j = 0; j < salesByYear.length; j++) {
        result = false;
        if (salesByYear[j]._id == i) {
          sales.push(salesByYear[j]);
          break;
        } else {
          result = true;
        }
      }
      if (result) sales.push({ _id: i, total: 0, count: 0 });
    }
    let salesData = [];
    for (let i = 0; i < sales.length; i++) {
      salesData.push(sales[i].total);
    }

    let usersByYear = await User.aggregate([
      {
        $match: { createdAt: { $gte: currentYear }, isBlocked: { $ne: true } },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    for (let i = 1; i <= 12; i++) {
      let result = true;
      for (let j = 0; j < usersByYear.length; j++) {
        result = false;
        if (usersByYear[j]._id == i) {
          users.push(usersByYear[j]);
          break;
        } else {
          result = true;
        }
      }
      if (result) users.push({ _id: i, count: 0 });
    }
    let usersData = [];
    for (let i = 0; i < users.length; i++) {
      usersData.push(users[i].count);
    }
    const categoryOrders = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $unwind: "$productData",
      },
      {
        $lookup: {
          from: "categories",
          localField: "productData.category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $unwind: "$categoryData",
      },
      {
        $group: {
          _id: "$categoryData.name",
          totalQuantitySold: { $sum: "$products.quantity" },
        },
      },
      {
        $project: {
          category: "$_id",
          totalQuantitySold: 1,
          _id: 0,
        },
      },
    ]);
    let ordersCategory = {};
    categoryOrders.forEach((category) => {
      ordersCategory[category.category] = category.totalQuantitySold;
    });

    const trending = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          total: { $sum: "$products.quantity" },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          _id: 0, // Exclude _id field from the result
          productId: "$_id",
          productName: "$productDetails.title",
          total: 1,
          productImage: "$productDetails.image",
        },
      },
    ]);

    res.render("dashboard", {
      currentWeekRevenue,
      cancelledCount,
      deliveredCount,
      ordersCategory,
      productsCount,
      categoryCount,
      todayRevenue,
      totalRevenue,
      ordersCount,
      placedCount,
      salesData,
      usersData,
      orderData,
      trending,
      earnings,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const adminLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};
const usersList = async (req, res) => {
  try {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const regex = new RegExp(`^${search}`, "i");
    const page = parseInt(req.query.page) || 1;
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / CONTENTS_PER_PAGE);

    const usersData = await User.find({
      $or: [{ name: { $regex: regex } }, { email: { $regex: regex } }],
    })
      .skip((page - 1) * CONTENTS_PER_PAGE)
      .limit(CONTENTS_PER_PAGE);
    res.render("userList", { users: usersData, totalPages, req, search });
  } catch (error) {
    console.log(error.message);
  }
};
const blockUser = async (req, res) => {
  try {
    const { id } = req.query;
    const user = await User.findById({ _id: id });
    if (user.isBlocked === false) {
      await User.findByIdAndUpdate({ _id: id }, { $set: { isBlocked: true } });
      res.redirect("/admin/userslist");
    } else {
      await User.findByIdAndUpdate({ _id: id }, { $set: { isBlocked: false } });
      res.redirect("/admin/userslist");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const orderList = async (req, res) => {
  try {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const regex = new RegExp(`^${search}`, "i");
    const page = parseInt(req.query.page) || 1;
    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / CONTENTS_PER_PAGE);

    const orderData = await Order.find({ method: { $regex: regex } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * CONTENTS_PER_PAGE)
      .limit(CONTENTS_PER_PAGE)
      .populate("user")
      .populate("products.productId")
      .exec();
    res.render("orderList", { orderData, totalPages, req, search });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
const orderDetails = async (req, res) => {
  try {
    const { id } = req.query;
    const orderDetails = await Order.findById({ _id: id }).populate(
      "products.productId"
    );
    res.render("orderDetails", { orderDetails });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
const updateStatus = async (req, res) => {
  try {
    const { userId } = req.session;
    const { status, orderId } = req.body;

    await Order.updateOne({ _id: orderId }, { $set: { status: status } });
    if (status === "Return Approved") {
      const order = await Order.findOne({ _id: orderId }).populate(
        "products.productId"
      );
      const total = order.total;
      const products = order.products;
      for (let product of products) {
        await Product.updateOne(
          { _id: product.productId },
          { $inc: { quantity: product.quantity } }
        );
      }
      await User.updateOne(
        { _id: userId },
        {
          $inc: { wallet: total },
          $push: {
            walletHistory: {
              date: new Date(),
              amount: +total,
              description: `Refunded for Order Return - Order ${orderId}`,
            },
          },
        }
      );
    }
    res.send({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};
const updateDeliveryDate = async (req, res) => {
  try {
    const { date, orderId } = req.body;
    await Order.updateOne(
      { _id: orderId },
      { $set: { expectedDelivery: date } }
    );
    res.send({ success: true });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
const cancelOrder = async (req, res) => {
  try {
    const { userId } = req.session;
    const { orderId, status } = req.body;
    const order = await Order.findById(orderId);
    await Order.updateOne({ _id: orderId }, { $set: { status: status } });
    if (order.method === "ONLINE" || order.method === "WALLET") {
      await User.updateOne(
        { _id: userId },
        {
          $inc: { wallet: order.walletAmountUsed }, // Increment the wallet field by the value of 'total'
          $push: {
            walletHistory: {
              date: new Date(),
              amount: +order.walletAmountUsed,
              description: `Refunded for Order cancel - Order ${orderId}`,
            },
          },
        }
      );
    }
    res.send({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};

const salesReportLoad = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / SALES_PER_PAGE);
    const orders = await Order.find()
      .skip((page - 1) * SALES_PER_PAGE)
      .limit(SALES_PER_PAGE)
      .sort({ createdAt: -1 })
      .populate("products.productId");
    res.render("salesReport", { orders, totalPages, req, moment });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
const datewiseReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const selectedDate = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId", // Use "products.productId" instead of "productId"
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $project: {
          _id: 0, // Exclude _id field from the result
          orderID: "$_id",
          productID: "$products.productId",
          productName: "$productDetails.title",
          productPrice: "$productDetails.price",
          productQuantity: "$products.quantity",
          paymentMethod: "$method",
          total: { $multiply: ["$productDetails.price", "$products.quantity"] },
          date: "$date",
          status: "$status",
        },
      },
    ]);

    res.status(200).json({ selectedDate: selectedDate });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

module.exports = {
  updateDeliveryDate,
  adminVerifyLogin,
  salesReportLoad,
  datewiseReport,
  loadDashboard,
  orderDetails,
  updateStatus,
  cancelOrder,
  adminLogout,
  adminLogin,
  usersList,
  blockUser,
  orderList,
};
