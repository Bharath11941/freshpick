const Banner = require("../models/bannerModel");
const fs = require("fs");
const path = require("path");
let BANNERS_PER_PAGE = 5;
const bannerList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const totalBanners = await Banner.countDocuments();
    const totalPages = Math.ceil(totalBanners / BANNERS_PER_PAGE);
    const bannerData = await Banner.find()
      .skip((page - 1) * BANNERS_PER_PAGE)
      .limit(BANNERS_PER_PAGE);
    res.render("bannerList", { bannerData, totalPages, req });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

const addBannerLoad = async (req, res) => {
  try {
    res.render("addBanner");
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
const postAddBanner = async (req, res) => {
  try {
    const { description, title } = req.sanitisedData;
    let imagearr = []; // Declare and initialize the 'image' variable as an empty array
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        imagearr.push(req.files[i].filename);
      }
    }
    const banner = new Banner({
      title: title,
      description: description,
      image: imagearr,
    });
    await banner.save();
    res.redirect("/admin/bannerList");
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
const editBanner = async (req, res) => {
  try {
    const { id } = req.query;
    const banner = await Banner.findById({ _id: id });
    res.render("editBanner", { banner });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
const postEditBanner = async (req, res) => {
  try {
    const { id, title, description } = req.sanitisedData;
    const existingBanner = await Banner.findById(id)
    let imagearr = [];
    if(existingBanner && existingBanner.image && existingBanner.image.length>0 ){
      imagearr = existingBanner.image
    }
     // Declare and initialize the 'image' variable as an empty array
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        imagearr.push(req.files[i].filename);
      }
    }
    await Banner.updateOne(
      { _id: id },
      {
        $set: {
          title: title,
          description: description,
          image: imagearr,
        },
      }
    );
    res.redirect("/admin/bannerList");
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
const deleteBannerImage = async (req, res) => {
  try {
    const { img, bannerId } = req.body;
    fs.unlink(path.join(__dirname, "../public/Banner", img), () => {});
    const deleted = await Banner.updateOne(
      { _id: bannerId },
      { $pull: { image: img } }
    );
    res.send({ success: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ success: false, error: error.message });
  }
};
const unlistBanner = async (req, res) => {
  try {
    const { id } = req.query;
    const banner = await Banner.findById({ _id: id });
    if (banner.status === true) {
      await Banner.updateOne({ _id: id }, { $set: { status: false } });
      res.redirect("/admin/bannerList");
    } else {
      await Banner.updateOne({ _id: id }, { $set: { status: true } });
      res.redirect("/admin/bannerList");
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
module.exports = {
  deleteBannerImage,
  postEditBanner,
  addBannerLoad,
  postAddBanner,
  unlistBanner,
  bannerList,
  editBanner,
};
