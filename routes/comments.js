var express = require("express"),
    Astro   = require("../models/astro"),
    Comment = require("../models/comment"),
    router  = express.Router({mergeParams: true});


router.post("/", isLoggedIn, function(req, res){
   Astro.findById(req.params.id, function(err, foundPost){
        if(err){
            console.log(err);
        } else{
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                } else{
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;

                    comment.save();

                    foundPost.comments.push(comment);
                    foundPost.save();

                    res.redirect("/astro/" + foundPost._id);
                }
            });
        }
   });
});

// router.get("/:comment_id/edit", checkOwnerShip, function(req, res){
//     Comment.findById(req.params.comment_id, function(err, capturedComment){
//         if(err){
//             console.log(err);
//         } else{
//             res.render("comment/edit", {astroVar_id: req.params.id, comment: capturedComment});
//         }
//     });
// });

router.put("/:comment_id", checkOwnerShip, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            console.log(err);
        } else{
            res.redirect("/astro/" + req.params.id);
        }
    });
});

router.delete("/:comment_id", checkOwnerShip, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err, deletedComment){
        if(err){
            console.log(err);
        } else{
            res.redirect("/astro/" + req.params.id);
        }
    });
});

//==============================
//middleware for authentication
//==============================

//making sure the user logged in middle ware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
      return next();
    }
    res.redirect("/login");
  }

//authority check
function checkOwnerShip(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                console.log(err);
            } else{
                if(foundComment.author.id.equals(req.user._id)){
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