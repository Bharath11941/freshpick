const multer = require("multer");
const path = require("path");

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/productImages"));
  },
  filename: (req, file, cb) => {
    const name = Date.now() + "-" +file.originalname;
    cb(null, name);
  },
});
const bannerStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/Banner"));
  },
  filename: (req, file, cb) => {
    const name = Date.now() + "-" +file.originalname;
    cb(null, name);
  },
});
const imageFilter = (req,file,cb)=>{
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)){
      req.fileValidationError = "Only file images are allowed..!!"
      return cb(new Error("Only file images are allowed..!!"),false)
    }
    cb(null,true)
}
const upload = multer({ storage: fileStorageEngine ,imageFilter:imageFilter});
const bannerUpoload = multer({ storage: bannerStorageEngine ,imageFilter:imageFilter});

module.exports = {
  upload,
  bannerUpoload
};
