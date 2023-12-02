const express = require('express')
const userRoute = express()
//view engine
userRoute.set('views','./views/users')
//parser
userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }));
//session
const userSession = require('../middlewares/userSession')
const sanitizeInput = require('../middlewares/inputSanitization')

const userController = require('../controllers/userController')
const cartController = require('../controllers/cartController')
const orderController = require("../controllers/orderController")
const wishlistController = require('../controllers/wishlistController')


userRoute.get('/',userController.loadHome)
userRoute.get('/login',userSession.isLogout,userController.login)
userRoute.post('/login',sanitizeInput,userController.verifyLogin)
userRoute.get('/logout',userSession.isLogin,userController.userLogout)
userRoute.get('/register',userSession.isLogout,userController.register)
userRoute.post('/register',sanitizeInput,userController.postRegister)
userRoute.post('/otp',sanitizeInput,userController.verifyMail)
userRoute.get('/otpResend',userController.resendOtp)

userRoute.get('/singleProduct',userController.loadSingleProduct)
userRoute.get('/shop',userController.getShop)

userRoute.get('/userProfile',userSession.isLogin,userController.userProfile)
userRoute.post('/updateProfile',userSession.isLogin,sanitizeInput,userController.updateProfile)
userRoute.get('/address',userSession.isLogin,userController.addressForm)
userRoute.post('/address',userSession.isLogin,sanitizeInput,userController.addAddress)
userRoute.post('/updateAddress',userSession.isLogin,sanitizeInput,userController.updateAddress)
userRoute.put('/deleteAddress',userSession.isLogin,userController.deleteAddress)
userRoute.get('/resetPassword',userSession.isLogin,userController.resetPassword)
userRoute.post('/resetPassword',sanitizeInput,userController.postResetPassword)
userRoute.get('/forgetPassword',userSession.isLogout,userController.forgetPasswordLoad)
userRoute.post('/forgetPassword',userSession.isLogout,sanitizeInput,userController.postForgetPassword)
userRoute.post('/newPassword',userSession.isLogout,sanitizeInput,userController.newPassword)

userRoute.get('/cart',userSession.isLogin,cartController.cartLoad)
userRoute.post('/addToCart',userSession.isLogin,cartController.addToCart)
userRoute.patch('/updateCart/:productId',userSession.isLogin,cartController.updateCart)
userRoute.put('/deleteCart',userSession.isLogin,cartController.deleteCart)


userRoute.get('/checkout',userSession.isLogin,orderController.checkoutLoad)
userRoute.post('/orderAddress',userSession.isLogin,orderController.orderAddress)
userRoute.post('/applyCoupon',userSession.isLogin,sanitizeInput,orderController.applyCoupon)
userRoute.post('/placeOrder',userSession.isLogin,orderController.placeOrder)
userRoute.get('/orderConfirm',userSession.isLogin,orderController.orderConfirm)
userRoute.post('/verifyPayment',userSession.isLogin,orderController.onlineVerifyPayment)
userRoute.get('/orderedList',userSession.isLogin,userController.orderedList)
userRoute.get('/orderedProduct',userSession.isLogin,userController.orderedProductDetails)
userRoute.patch('/cancelOrder',userSession.isLogin,userController.cancelOrder)
userRoute.patch('/returnOrder',userSession.isLogin,userController.returnOrder)
userRoute.get('/walletHistory',userSession.isLogin,userController.walletHistory)
userRoute.get('/invoice',userSession.isLogin,userController.invoiceDownload)

userRoute.get('/wishlist',userSession.isLogin,wishlistController.wishlistLoad)
userRoute.put('/wishlist',userSession.isLogin,wishlistController.addWishlist)
userRoute.patch('/deleteWishlist',userSession.isLogin,wishlistController.deleteWishlistProduct)


module.exports = userRoute