const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
const userHelpers = require('../helpers/user-helpers')
const verifyLogine=(req,res,next)=>{
  if(req.session.userLoggedIn){
    next()
  }
  else{
    res.redirect('/login')
  }
}

/* GET home page. */  
router.get('/', async  (req, res, next)=> {
  let user = req.session.user
  let cartCount = null;
  productHelpers.getAllProducts().then((products)=>{
    if(user){
      cartCount= userHelpers.getCartCount(req.session.user._id)
      console.log("CartCount-");
    }
    
    res.render('user/view-products',{products,user,cartCount});
  })
});

router.get('/login',(req,res)=>{
  if(req.session.user){
    res.redirect('/')
  }
  else{
    res.render('user/login',{"loginErr":req.session.userLoginErr})
    req.session.userLoginErr = false;
  }
  
})

router.get('/signup',(req,res)=>{
  res.render('user/signup')
})

router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
    
    req.session.user=response.user
    req.session.user.loggedIn=true
    res.redirect('/')
  })
})

router.post('/login', (req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      
      req.session.user=response.user
      req.session.user.loggedIn=true
      res.redirect('/')
    }
    else{
      req.session.loginErr = "Invalid Username or password";
      res.redirect('/login');
    }
  })
})

router.get('/payment',(req,res)=>{
  res.render("user/payment",{user:req.session.user})
})

router.get('/cart',verifyLogine, async(req,res)=>{
  let products = await userHelpers.getCartProducts(req.session.user._id);
  let total = 0
  if(products.length>0){
    total = await userHelpers.getTotalAmount(req.session.user._id)
  }
  
  res.render("user/cart",{products,user:req.session.user,total})
})

router.get('/logout',(req,res)=>{
  req.session.user=null
  req.session.userLoggedIn=false
  res.redirect('/login')
})

router.get('/add-to-cart/:id',(req,res)=>{
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
  })
})

router.post('/change-product-quantity',(req,res,next)=>{
  userHelpers.changeProductQuantity(req.body).then(async (response)=>{
    response.total = await userHelpers.getTotalAmount(req.body.user) 
    
    res.json(response)
  })
})

router.get('/place-order',verifyLogine,async(req,res)=>{
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render("user/place-order",{user:req.session.user,total})
})

router.post('\place-order',async (req,res)=>{
  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    if(req.body['payment-method']==="COD"){
      res.json({codSuccess:true})
    }
    else{
      userHelpers.generateRazorpay(orderId).then((response,totalPrice)=>{
        res.json(response)
      })
    }
    
  })
})

router.get('/orders',verifyLogine,async(req,res)=>{
  let orders = await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/orders',{user:req.session.user,orders})
})

router.get('order-success',verifyLogine,(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
})

router.get('/view-order-products/:id',verifyLogine,async(req,res)=>{
  let products = await userHelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-products',{user:req.session.user,products})
})


router.post('/verify-payment',(req,res)=>{
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err);
    res.json({status:false,errMsg:'err'})
  })
})

module.exports = router;

