const Category = require("../models/categoryModel");

const viewCategory = async (req, res) => {
  try {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const regex = new RegExp(`^${search}`, "i");

    const categories = await Category.find({ name: { $regex: regex } });
    const errMessage = req.session.message;
    res.render("category", { categories, errMessage, search });
  } catch (error) {
    console.log(error.message);
  }
};
const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const categoryData = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (categoryData) {
      req.session.message = "This category already exists";
      res.redirect("/admin/viewCategory");
    } else {
      const category = new Category({
        name: name,
        description: description,
      });
      await category.save();
      viewCategory(req, res);
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editCategory = async (req, res) => {
  try {
    const { id } = req.query;
    const categoryData = await Category.findOne({ _id: id });
    if (categoryData) {
      res.render("editCategory", { categoryData });
    } else {
      res.redirect("/admin/viewCategory");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const updateCategory = async (req, res) => {
  try {
    const { id, name, description } = req.body;
    const categoryData = await Category.findByIdAndUpdate(
      { _id: id },
      { $set: { name: name, description: description } }
    );
    res.redirect("/admin/viewCategory");
  } catch (error) {
    console.log(error.message);
  }
};
const unlistCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const category = await Category.findOne({ _id: id });
    if (category.status === true) {
      await Category.updateOne({ _id: id }, { $set: { status: false } });
      res.redirect("/admin/viewCategory");
    } else {
      await Category.updateOne({ _id: id }, { $set: { status: true } });
      res.redirect("/admin/viewCategory");
    }
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  unlistCategory,
  updateCategory,
  viewCategory,
  editCategory,
  addCategory,
};
