const express = require('express')
const adminRoute = express()

//view engine
adminRoute.set('views','./views/admin')
//parser
adminRoute.use(express.json());
adminRoute.use(express.urlencoded({ extended: true }));
const adminSession = require('../middlewares/adminSession')

const adminController = require('../controllers/adminController')
const categoryController = require('../controllers/categoryController')
const upload = require('../middlewares/uploadImages')
const productController = require('../controllers/productController')
const orderController = require("../controllers/orderController")
const bannerController = require('../controllers/bannerController')
const couponController = require("../controllers/couponController")
const sanitizeInput = require("../middlewares/inputSanitization")

adminRoute.get('/',adminSession.isLogout,adminController.adminLogin)
adminRoute.post('/',sanitizeInput,adminController.adminVerifyLogin)

adminRoute.get('/logout',adminSession.isLogin,adminController.adminLogout)

adminRoute.get('/dashboard',adminSession.isLogin,adminController.loadDashboard)
adminRoute.get('/usersList',adminSession.isLogin,adminController.usersList)

adminRoute.get('/blockUser',adminSession.isLogin,adminController.blockUser)


adminRoute.get('/viewCategory',adminSession.isLogin,categoryController.viewCategory)
adminRoute.post('/addCategory',adminSession.isLogin,sanitizeInput,categoryController.addCategory)
adminRoute.get('/editCategory',adminSession.isLogin,categoryController.editCategory)
adminRoute.post('/editCategory',adminSession.isLogin,sanitizeInput,categoryController.updateCategory)
adminRoute.get('/unlistCategory',adminSession.isLogin,categoryController.unlistCategory)

adminRoute.get('/viewProduct',adminSession.isLogin,productController.viewProduct)
adminRoute.get('/addProduct',adminSession.isLogin,productController.addProductLoad)
adminRoute.post('/addProduct',adminSession.isLogin,upload.upload.array('image',5),sanitizeInput,productController.postProduct)
adminRoute.get('/editProduct',adminSession.isLogin,productController.editProduct)
adminRoute.post('/editProduct',adminSession.isLogin,upload.upload.array('image',5),sanitizeInput,productController.updateProduct)
adminRoute.get('/unlistProduct',adminSession.isLogin,productController.unlistProduct)
adminRoute.put('/deleteImage',adminSession.isLogin,productController.deleteImage)

adminRoute.get('/orderList',adminSession.isLogin,adminController.orderList)
adminRoute.get('/orderDetails',adminSession.isLogin,adminController.orderDetails)
adminRoute.patch('/updateStatus',adminSession.isLogin,adminController.updateStatus)
adminRoute.patch('/updatedDate',adminSession.isLogin,adminController.updateDeliveryDate)
adminRoute.put('/cancelOrder',adminSession.isLogin,adminController.cancelOrder)

adminRoute.get('/bannerList',adminSession.isLogin,bannerController.bannerList)
adminRoute.get('/addBanner',adminSession.isLogin,bannerController.addBannerLoad)
adminRoute.post('/addBanner',adminSession.isLogin,upload.bannerUpoload.array('image',5),sanitizeInput,bannerController.postAddBanner)
adminRoute.get('/editBanner',adminSession.isLogin,bannerController.editBanner)
adminRoute.post('/editBanner',adminSession.isLogin,upload.bannerUpoload.array('image',5),sanitizeInput,bannerController.postEditBanner)
adminRoute.put('/deleteBannerImage',adminSession.isLogin,bannerController.deleteBannerImage)
adminRoute.get('/unlistBanner',adminSession.isLogin,bannerController.unlistBanner)

adminRoute.get('/couponList',adminSession.isLogin,couponController.couponList)
adminRoute.get('/addCoupon',adminSession.isLogin,couponController.getAddCoupon)
adminRoute.post('/addCoupon',adminSession.isLogin,sanitizeInput,couponController.postAddCoupon)
adminRoute.get('/editCoupon',adminSession.isLogin,couponController.editCoupon)
adminRoute.post('/editCoupon',adminSession.isLogin,sanitizeInput,couponController.updateCoupon)
adminRoute.get('/deleteCoupon',adminSession.isLogin,couponController.deleteCoupon)

adminRoute.get("/salesReport",adminSession.isLogin,adminController.salesReportLoad)
adminRoute.post('/salesReport',adminSession.isLogin,adminController.datewiseReport)
module.exports = adminRoute