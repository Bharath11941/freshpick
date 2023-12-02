const User = require("../models/userModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { bannerList } = require("./bannerController");
const Banner = require("../models/bannerModel");
require("dotenv").config();
const mongoose = require("mongoose");


const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const sendEmail = async (name, email, user_id) => {
  try {
    
    otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const options = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "for email verification",
      html: `
      <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
        <div style="margin: 50px auto; width: 70%; padding: 20px 0">
          <div style="border-bottom: 1px solid #eee">
            <a href="" style="font-size: 1.4em; color: #82AE46; text-decoration: none; font-weight: 600">
              Fresh Pick
            </a>
          </div>
          <p style="font-size: 1.1em">Hi,${name}</p>
          <p>Thank you for choosing Fresh Pick. Use the following OTP to complete your Sign Up procedures. OTP is valid for a few minutes</p>
          <h2 style="background: #82AE46; margin: 0 auto; width: max-content; padding: 0 10px; color: white; border-radius: 4px;">
            ${otp}
          </h2>
          <p style="font-size: 0.9em;">Regards,<br />Fresh Pick</p>
          <hr style="border: none; border-top: 1px solid #eee" />
          <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
            <p>Fresh Pick</p>
            <p>1600 Ocean Of Heaven</p>
            <p>Pacific</p>
          </div>
        </div>
      </div>
    `
    };
    

    transporter.sendMail(options, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(otp);
        console.log("email has been sent to:-", info.response);
      }
    });
    return otp;
  } catch (error) {
    console.log(error.message);
  }
};
//controller functions

const login = async (req, res) => {
  try {
    let {succMessage} = req.session
    const errMessage = req.session.emailErressage;
    req.session.succMessage=''
    res.render("userLogin", { errMessage ,succMessage });
  } catch (error) {
    console.log(error.message);
  }
};
const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.sanitisedData;
    
    const userData = await User.findOne({ email: email });
    if (userData) {
      const passswordMatch = await bcrypt.compare(password, userData.password);
      if (userData.isVerified) {
        if (!userData.isBlocked) {
          if (passswordMatch) {
            req.session.user = email;
            req.session.isBlocked = userData.isBlocked;
            req.session.userId = userData._id;
            res.redirect("/");
          } else {
            res.render("userLogin", {
              errMessage: "password is incorrect",
            });
          }
        } else {
          res.render("userLogin", {
            errMessage: "Your account has blocked by admin",
          });
        }
      } else {
        res.render("userLogin", { errMessage: "Please verify your email" });
      }
    } else {
      req.session.emailErressage = "Invalid Email";
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.render("userLogin", { errMessage: "Something happened" });
  }
};

const register = async (req, res) => {
  try {
    res.render("userRegister");
  } catch (error) {
    console.log(error.message);
  }
};
const postRegister = async (req, res) => {
  try {
    const { password, confirmPassword } = req.sanitisedData;
    if (password === confirmPassword) {
      const passwordHash = await bcrypt.hash(req.sanitisedData.password, 10);
      const fname = req.sanitisedData.fname;
      const lname = req.sanitisedData.lname;
      const mobile = req.sanitisedData.mobile;
      const email = req.sanitisedData.email;
      const user = new User({
        fname: fname,
        lname: lname,
        mobile: mobile,
        email: email,
        password: passwordHash,
      });
      let userData;
      const checkEmail = await User.findOne({
        $or: [{ email: email }, { mobile: mobile }],
      });
      if (checkEmail) {
        res.render("userRegister", {
          errMessage: "This user is already registered using provided email or mobile",
        });
      } else {
        userData = await user.save();
      }
      req.session.tempEmail = userData.email;
      req.session.userName = userData.fname

      if (userData) {
        if (userData.isVerified) {
          res.render("userRegister", {
            succMessage: "Registration successful",
          });
        } else {
          const otp = await sendEmail(
            req.sanitisedData.fname,
            req.sanitisedData.email,
            userData._id
          );
          req.session.otp = otp;
          res.render("emailOtp", {
            succMessage: "Enter otp to verify your email",
          });
        }
      } else {
        res.render("userRegister", {
          errMessage: "Your registration has been failed.",
        });
      }
    } else {
      res.render("userRegister", {
        errMessage: "Both passwords must be equal",
      });
    }
  } catch (error) {
    console.log(Error.message);
  }
};

const verifyMail = async (req, res) => {
  try {
    let recievedOtp = req.sanitisedData.Otp;
    let { forgot } = req.sanitisedData;
    if (forgot) {
      const { email } = req.sanitisedData;
      if (req.session.forOtp == recievedOtp) {
        res.render("newPassword", { email });
      } else {
        res.render("emailOtp", {
          errMessage: "Invalid otp.Please check your otp",
        });

        res.status(500).send("Invalid Otp");
      }
    } else {
      if (recievedOtp === req.session.otp) {
        req.session.succMessage = "Successfully Registered"
        res.redirect("/login");
        const userData = await User.updateOne(
          { email: req.session.tempEmail },
          { $set: { isVerified: true } }
        );
      } else {
        res.render("emailOtp", {
          errMessage: "Invalid otp.Please check your otp",
        });

        res.status(500).send("Invalid Otp");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};
const resendOtp = async (req,res) =>{
  try {
    const otp = await sendEmail(
      req.session.userName,
      req.session.tempEmail,
      "547903987"
    );
    req.session.otp = otp;
    res.render("emailOtp", {
      succMessage: "Enter otp to verify your email",
    });
  } catch (error) {
    
  }
}
const loadHome = async (req, res) => {
  try {
    const { user } = req.session;
    const products = await Product.find({ status: true }).populate("category");
    const banner = await Banner.find();
    const userOnline = await User.findOneAndUpdate(
      { email: user },
      { $set: { isOnline: true } }
    );
    if (user) {
      req.session.cartCount = userOnline.cart.length;
    }
    res.render("userHome", { products, user, banner });
  } catch (error) {
    console.log(error.message);
  }
};
const userLogout = async (req, res) => {
  try {
    const email = req.session.user;
    await User.findOneAndUpdate(
      { email: email },
      { $set: { isOnline: false } }
    );
    req.session.destroy();
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};
const loadSingleProduct = async (req, res) => {
  try {
    const { id } = req.query;
    const { user } = req.session;
    const singleProduct = await Product.findById({ _id: id }).populate(
      "category"
    );
    const products = await Product.find({ status: true }).populate("category");
    res.render("singleproduct", { singleProduct, products, user });
  } catch (error) {
    console.log(error.message);
  }
};

const getShop = async (req, res) => {
  try {
    const { user } = req.session;
    const { cat, search } = req.query;
    const PRODUTS_PER_PAGE = 4;
    let page = Number(req.query.page);
    if (isNaN(page) || page < 1) {
      page = 1;
    }
    const condition = { status: true };
    if (cat) {
      condition.category = cat;
    }
    if (search) {
      condition.title = { $regex: search, $options: "i" }
      // condition.title = { $regex: new RegExp(`^${search}`, "i") };
    }
    const productCount = await Product.find(condition).count();
    const productData = await Product.find(condition)
      .skip((page - 1) * PRODUTS_PER_PAGE)
      .limit(PRODUTS_PER_PAGE)
      .populate("category");
    const categories = await Category.find({ status: true });
    const startingNo = (page - 1) * PRODUTS_PER_PAGE + 1;
    const endingNo = startingNo + PRODUTS_PER_PAGE;
    res.render("shop", {
      products: productData,
      category: categories,
      totalCount: productCount,
      currentPage: page,
      hasNextPage: page * PRODUTS_PER_PAGE < productCount, // Checks is there is any product to show to next page
      hasPrevPage: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
      lastPage: Math.ceil(productCount / PRODUTS_PER_PAGE),
      startingNo: startingNo,
      endingNo: endingNo,
      search,
      cat: cat,
      user,
    });
  } catch (error) {
    console.error("Error in getShop:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const userProfile = async (req, res) => {
  try {
    const userData = await User.findOne({ email: req.session.user });
    const email = req.session.user;
    const addAddressDetails = await User.findOne(
      { email: email },
      { address: 1 }
    );
    res.render("userprofile", { userData, addAddressDetails });
  } catch (error) {
    console.log(error.message);
  }
};
const updateProfile = async (req, res) => {
  try {
    const { fname, lname,  mobile } = req.sanitisedData;
    await User.updateOne(
      { email: req.session.user },
      { $set: { fname: fname, lname: lname, mobile: mobile } }
    );
    res.redirect("/userprofile");
  } catch (error) {
    console.log(error.message);
  }
};
const addressForm = async (req, res) => {
  try {
    const { userId, addressId, check } = req.query;
    const addAddressDetails = await User.findOne(
      { _id: userId, "address._id": addressId },
      { address: 1 }
    );
    console.log(check);
    res.render("address", { addAddressDetails, check });
  } catch (error) {
    console.log(error.message);
  }
};
const addAddress = async (req, res) => {
  try {
    const email = req.session.user;
    const { name, housename, city, district, state, mobile, pincode } =
      req.sanitisedData;
     await User.updateOne(
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
    res.redirect("/userprofile");
  } catch (error) {
    console.log(error.message);
  }
};
const updateAddress = async (req, res) => {
  try {
    const {
      userId,
      addressId,
      name,
      housename,
      city,
      district,
      state,
      mobile,
      pincode,
      fromCheckout,
    } = req.sanitisedData;
    await User.updateOne(
      { _id: userId, "address._id": addressId },
      {
        $set: {
          "address.$.name": name,
          "address.$.housename": housename,
          "address.$.city": city,
          "address.$.district": district,
          "address.$.state": state,
          "address.$.mobile": mobile,
          "address.$.pincode": pincode,
        },
      }
    );
    if (fromCheckout) {
      res.redirect("/checkout");
    } else {
      res.redirect("/userprofile");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const user = req.session.user;
    const { addressId } = req.body;
     await User.updateOne(
      { email: user },
      { $pull: { address: { _id: addressId } } }
    );
    res.send({ success: true }); // Send a response indicating successful deletion
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ success: false, error: error.message }); // Send an error response if deletion fails
  }
};
const resetPassword = async (req, res) => {
  try {
    res.render("resetPassword");
  } catch (error) {
    console.log(error.message);
  }
};
const postResetPassword = async (req, res) => {
  try {
    const { password, oldPassword } = req.sanitisedData;
    const { userId } = req.session;
    const userData = await User.findById({ _id: userId });
    const passswordMatch = await bcrypt.compare(oldPassword, userData.password);
    if (passswordMatch) {
      const passwordHash = await bcrypt.hash(password, 10);
      await User.updateOne(
        { _id: userId },
        { $set: { password: passwordHash } }
      );
      res.redirect("/userProfile");
    } else {
      res.render("resetPassword", { errMessage: "Old password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const forgetPasswordLoad = async (req, res) => {
  try {
    const errMessage = req.session.formessage || "";
    res.render("forgotPassword", { errMessage });
  } catch (error) {
    console.log(error.message);
  }
};
const postForgetPassword = async (req, res) => {
  try {
    const { email } = req.sanitisedData;
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.isVerified) {
        if (userData.isBlocked === false) {
          const otp = await sendEmail(userData.fname, email, userData._id);
          req.session.forOtp = otp;
          res.render("emailOtp", {
            succMessage: "Enter otp to verify your email",
            formessage: "true",
            email,
          });
        } else {
          res.render("forgotPassword", { errMessage: "User isBlocked!.." });
        }
      } else {
        res.render("forgotPassword", {
          errMessage: "User email is not verified!..",
        });
      }
    } else {
      req.session.formessage = "This email is not registered";
      res.redirect("/forgetPassword");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const newPassword = async (req, res) => {
  try {
    const { password, email } = req.sanitisedData;
    const passwordHash = await bcrypt.hash(password, 10);
    await User.updateOne(
      { email: email },
      { $set: { password: passwordHash } }
    );
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};
const orderedList = async (req, res) => {
  try {
    const { userId } = req.session;
    const orderHistory = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user")
      .populate("products.productId");
    res.render("orderedList", { orderHistory });
  } catch (error) {
    console.log(error.message);
  }
};
const orderedProductDetails = async (req, res) => {
  try {
    const { id } = req.query;
    const order = await Order.findById({ _id: id }).populate(
      "products.productId"
    );
    
    res.render("orderedProducts", { order });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
const cancelOrder = async (req, res) => {
  try {
    const { userId } = req.session;
    const { orderId, total } = req.body;
    let status1 = "Cancelled";
    const order = await Order.findOne({ _id: orderId }).populate(
      "products.productId"
    );
    await Order.updateOne({ _id: orderId }, { $set: { status: status1 } });
    const products = order.products;
    for (let product of products) {
      await Product.updateOne(
        { _id: product.productId },
        { $inc: { quantity: product.quantity } }
      );
    }

    if (order.method === "ONLINE" || order.method === "WALLET") {
      await User.updateOne(
        { _id: userId },
        {
          $inc: { wallet: total }, // Increment the wallet field by the value of 'total'
          $push: {
            walletHistory: {
              date: new Date(),
              amount: order.total,
              description: `Refunded for Order cancel - Order ${orderId}`,
            },
          },
        }
      );
    }
    res.send({ success: true, status: status1 });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

const returnOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    let status1 = "Return Pending";
    await Order.updateOne({ _id: orderId }, { $set: { status: status1 } });

    res.send({ success: true, status: status1 });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
const walletHistory = async (req, res) => {
  try {
    const { userId } = req.session;
    const walletData = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {$project:{walletHistory:1}},
      { $unwind: "$walletHistory" },
      { $sort: { "walletHistory.date": -1 } },
    ]);
    res.render("walletHistory", { walletData });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
const invoiceDownload = async (req,res) => {
  try {
    const {orderId} = req.query
    const {userId} = req.session
    let sumTotal = 0
    const userData = await User.findById(userId)
    const orderData = await Order.findById(orderId).populate('products.productId')
    orderData.products.forEach(item =>{
      const total = item.productId.price *  item.quantity
      sumTotal += total
    })
    
    const date = new Date()
    const data = {
      order:orderData,
      user:userData,
      date,
      sumTotal
    }
    const filepathName = path.resolve(__dirname,"../views/users/invoice.ejs")
    const html = fs.readFileSync(filepathName).toString()
    const ejsData = ejs.render(html,data)
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(ejsData, { waitUntil: "networkidle0" });
    const pdfBytes = await page.pdf({ format: "Letter" });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename= order invoice.pdf"
    );
    res.send(pdfBytes);
  } catch (error) {
    console.log(error.message);
  }
}


module.exports = {
  orderedProductDetails,
  forgetPasswordLoad,
  postForgetPassword,
  loadSingleProduct,
  postResetPassword,
  invoiceDownload,
  updateProfile,
  updateAddress,
  deleteAddress,
  walletHistory,
  resetPassword,
  postRegister,
  newPassword,
  verifyLogin,
  userProfile,
  addressForm,
  orderedList,
  returnOrder,
  cancelOrder,
  verifyMail,
  addAddress,
  userLogout,
  resendOtp,
  loadHome,
  register,
  getShop,
  login,
};
