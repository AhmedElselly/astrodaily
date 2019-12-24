var express = require('express');
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get("/register", function(req, res){
  res.render("register");
});

router.post("/register", function(req, res){
  var newUser = new User({
    email: req.body.email,
    username: req.body.username
  });

  User.register(newUser, req.body.password, function(err, newUser){
    if(err){
      console.log(err);
      return res.redirect("/register");
    } 
    passport.authenticate("local")(req, res, function(){
      res.redirect("/astro");
    });
  });
});

router.get("/login", function(req, res){
  res.render("login");
});

router.post("/login", async function(req, res, next){
  const {username, password} = req.body;
        const {user, error} = await User.authenticate()(username, password);
        if(!user && error) return next(error);
        req.login(user, function(err){
            if(err) return next(err);        
            res.redirect('/astro');
        });
});

router.get("/logout", function(req, res, next){
  req.logOut();
  res.redirect("/astro");
});


module.exports = router;
