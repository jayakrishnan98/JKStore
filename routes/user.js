var express = require('express');
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
const userHelpers = require('../helpers/user-helpers')
const verifyLogine=(req,res,next)=>{
  if(req.session.loggedIn){
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
      cartCount= userHelpers.getCartCount(user._id)
    }
    res.render('user/view-products',{products,user,cartCount});
  })
});

router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }
  else{
    res.render('user/login',{"loginErr":req.session.loginErr})
    req.session.loginErr = false;
  }
  
})

router.get('/signup',(req,res)=>{
  res.render('user/signup')
})

router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
    req.session.loggedIn=true
    req.session.user=response.user
    res.redirect('/')
  })
})

router.post('/login', (req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
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
  res.render("user/cart",{products,user:req.session.user})
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/login')
})

router.get('/add-to-cart/:id',(req,res)=>{
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
  })
})



module.exports = router;

