var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var Astro = require("../models/astro");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'elselly', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.get("/", async function(req, res){
    Astro.paginate({}, {
        page: req.query.page || 1,
        limit: 10,
        sort: {'_id': -1}
    }, function(err, allAstro){
        if(err){
            console.log(err);
        } else{
            res.render("astro/index", {astroVar: allAstro});
        }
    });
});

router.get("/new", isLoggedIn, function(req, res){
    res.render("astro/new");
});

router.post("/", isLoggedIn, upload.single("image"), function(req, res){
    cloudinary.v2.uploader.upload(req.file.path, function(err, result){
        if(err){
            console.log(err);
        } else{
             // add cloudinary url for the image to the campground object under image property
            req.body.astro.image = result.secure_url;
            //add image's public id to astro object
            req.body.astro.imageId = result.public_id;
            //add author to astro post
            req.body.astro.author = {
                id: req.user._id,
                username: req.user.username
            }

            Astro.create(req.body.astro, function(err, newPost){
                if(err){
                    console.log(err);
                } else{
                    res.redirect("/astro/" + newPost.id);
                }
            });
        }
       
    })
   

    // var title = req.body.title;
    // var image = req.body.image;
    // var description = req.body.description;
    // var author = {
    //     id: req.user._id,
    //     username: req.user.username
    // };
    // var astronomy = {title: title, image: image, description: description, author: author}

    // Astro.create(astronomy, function(err, postedAstro){
    //     if(err){
    //         console.log(err);
    //         res.redirect("/astro/new");
    //     }else{
    //         res.redirect("/astro");
    //     }
    // });
});

router.get("/:id", function(req, res){
    Astro.findById(req.params.id).populate("comments").exec(function(err, foundPost){
        if(err){
            console.log(err);
        } else{
            res.render("astro/show", {astroVar: foundPost});
        }
    });
});

router.get("/:id/edit", ownerShip, function(req, res){
    Astro.findById(req.params.id, function(err, editRoute){
        if(err){
            console.log(err);
        } else{
            res.render("astro/edit", {astroVar: editRoute});
        }
    })
});

router.put("/:id", ownerShip, upload.single("image"), function(req, res){
    
    Astro.findById(req.params.id, async function(err, updatedPost){
        if(err){
            console.log(err);
        } else{
            if(req.file){
                try{
                    //delete the file from cloudinary
                    await cloudinary.v2.uploader.destroy(updatedPost.imageId);
                    //upload a new one
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    //add cloudinary url for the image to the astro object
                    updatedPost.imageId = result.public_id;
                    //add image's public_id to astro object
                    updatedPost.image = result.secure_url;
                } catch(err){
                    console.log(err);
                    return res.redirect("back");
                }       
            }
            updatedPost.title = req.body.astronomy.title;
            updatedPost.description = req.body.astronomy.description;
            updatedPost.save();
            res.redirect("/astro/" + req.params.id);
        }
        
    });    
});

router.delete("/:id", ownerShip, function(req, res){
    Astro.findById(req.params.id, async function(err, foundPost){
        if(err){
            res.redirect("/astro");
        } else{
            try{
                await cloudinary.v2.uploader.destroy(foundPost.imageId);
                foundPost.remove();
                res.redirect("/astro");
            } catch(err){
                res.redirect("/astro");
            }

        }
    });
});

//middleware authentication

//checking the logged method
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
      return next();
    }
    res.redirect("/login");
}

//checking the ownership
function ownerShip(req, res, next){
    if(req.isAuthenticated()){
        Astro.findById(req.params.id, function(err, foundPost){
            if(err){
                res.redirect("back");
            } else{
              if(foundPost.author.id.equals(req.user._id)){
                next();
              } else{
                res.redirect("back");
              }
            }
          });
        } else{
            res.redirect("back");
        }
    }


module.exports = router;