const Product = require("../models/productModel");
const Category = require("../models/categoryModel");

const fs = require("fs");
const path = require("path");
const sharp = require("sharp")

const viewProduct = async (req, res) => {
  try {
    const ITEMS_PER_PAGE = 5;
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const regex = new RegExp(`^${search}`, "i");
    const page = parseInt(req.query.page) || 1;
    const totalProducts = await Product.find({ title: { $regex: regex } }).count()
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

    const products = await Product.find({ title: { $regex: regex } })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate("category");

    res.render("viewproduct", { products, totalPages, req, search });
  } catch (error) {
    console.log(error.message);
  }
};
const addProductLoad = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render("addproduct", { categories });
  } catch (error) {
    console.log(error.message);
  }
};
const postProduct = async (req, res) => {
  try {
    const { title, description, price, quantity, category } = req.sanitisedData;
    
    const resizedImages = []
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const rezizedPath = path.join(__dirname, "../public/productImages/resized",req.files[i].filename)
        await sharp (req.files[i].path).
        resize(1000,800,{fit:"fill"}).
        toFile(rezizedPath)
        resizedImages[i] = req.files[i].filename
      }
    }
    const checkProduct = await Product.findOne({ title: title });
    const products = new Product({
      title: title,
      description: description,
      price: price,
      quantity: quantity,
      category: category,
      image: resizedImages,
    });
    if (checkProduct) {
      res.render("addproduct", {
        errMessage: "This product is already there",
      });
    } else {
       await products.save();
      res.redirect("/admin/viewproduct");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editProduct = async (req, res) => {
  try {
    const { id } = req.query;
    const productData = await Product.findById({ _id: id });
    if (productData) {
      const categories = await Category.find();
      res.render("editproduct", { productData, categories });
    } else {
      res.redirect("/admin/viewproduct");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const updateProduct = async (req, res) => {
  try {
    const { id, title, description, price, quantity, category } = req.sanitisedData;
    let existingProduct = await Product.findById(id);
    let resizedImages = []
    if (
      existingProduct &&
      existingProduct.image &&
      existingProduct.image.length > 0
    ) {
      resizedImages = existingProduct.image;
    }
    
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const rezizedPath = path.join(__dirname, "../public/productImages/resized",req.files[i].filename)
        await sharp (req.files[i].path).
        resize(1000,800,{fit:"fill"}).
        toFile(rezizedPath)
        resizedImages.push(req.files[i].filename)
      }
    }
     await Product.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          title: title,
          description: description,
          price: price,
          quantity: quantity,
          category: category,
          image: resizedImages,
        },
      }
    );
    res.redirect("/admin/viewproduct");
  } catch (error) {
    console.log(error.message);
  }
};
const unlistProduct = async (req, res) => {
  try {
    const { id } = req.query;
    const product = await Product.findOne({ _id: id });
    if (product.status === true) {
      await Product.updateOne({ _id: id }, { $set: { status: false } });
      res.redirect("/admin/viewproduct");
    } else {
      await Product.updateOne({ _id: id }, { $set: { status: true } });
      res.redirect("/admin/viewproduct");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const deleteImage = async (req, res) => {
  try {
    const { img, prdtId } = req.body;

    fs.unlink(path.join(__dirname, "../public/productImage/resized", img), () => {});
     await Product.updateOne(
      { _id: prdtId },
      { $pull: { image: img } }
    );
    res.send({ success: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ success: false, error: error.message });
  }
};
module.exports = {
  addProductLoad,
  updateProduct,
  unlistProduct,
  viewProduct,
  postProduct,
  editProduct,
  deleteImage,
};
