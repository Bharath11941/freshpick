const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const userSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
      trim: true,
    },
    lname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    address: [
      {
        name: {
          type: String,
        },
        housename: {
          type: String,
        },
        city: {
          type: String,
        },
        district: {
          type: String,
        },
        state: {
          type: String,
        },
        mobile: {
          type: Number,
        },
        pincode: {
          type: Number,
        },
      },
    ],
    cart: [
      {
        productId: {
          type: ObjectId,
          ref: "product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        total: {
          type: Number,
          default: 0,
        },
      },
    ],
    wishlist: [
      {
        productId: {
          type: ObjectId,
          ref: "product",
          required: true,
        },
        date: {
          type: Date,
        },
      },
    ],
    walletHistory: [
      {
        date: {
          type: Date,
        },
        amount: {
          type: Number,
        },
        description: {
          type: String,
        },
      },
    ],
    grandTotal: {
      type: Number,
      default: 0,
    },
    wallet: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const user = mongoose.model("user", userSchema);
module.exports = user;
