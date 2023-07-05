const router = require ("express").Router();
const User = require ("../modules/User");
const bcrypt = require("bcrypt");

//update user
router.put("/:id", async(req,res)=>{
    if(req.body.userId === req.params.id || req.body.isAdmin){
        if(req.body.password){
            try{
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password,salt);
            } catch(err){
                return res.status(500).json(err); 
            }
        }
            User.findByIdAndUpdate(req.params.id,{$set: req.body}).then((updated)=>{
                if(updated)
                    res.status(200).json("Account updated successfully.");
                else
                    res.status(405).json("User not found with this Id");
            }).catch((err)=>{
                res.status(500).json(err);
            });
    }else{
        res.status(403).json("You can only update your account!");
    }
});
//delete user
router.delete("/:id", async(req,res)=>{
    if(req.body.userId === req.params.id || req.body.isAdmin){
            User.findByIdAndDelete(req.params.id).then((deleted)=>{
                if(deleted)
                    res.status(200).json("Account deleted successfully.");
                else
                    res.status(405).json("User not found with this Id");
            }).catch((err)=>{
                res.status(500).json(err);
            });
    }else{
        res.status(403).json("You can only delete your account!");
    }
});
//get a user
router.get("/:id",async (req,res)=>{
    await User.findById(req.params.id).then((foundUser)=>{
        if(foundUser){
            const {password,createdAt,updatedAt,...other} = foundUser._doc;
            res.status(200).json(other);
        }
        else    
            res.status(404).json("No user found with this id");
    }).catch((err)=>{
        res.status(500).json(err);
    })
});
//follow a user
router.put("/:id/follow",async (req,res)=>{
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const currUser = await User.findById(req.body.userId);
            if(!user.followers.includes(currUser._id)){
                await user.updateOne({ $push : { followers : req.body.userId} });
                await currUser.updateOne({ $push : { followings : req.params.id} });
                res.status(200).json("User has been followed");
            }else{
                res.status(403).json("You already follow this user.");
            }
        }catch(err){
            res.status(500).json(err);
        }
    }else{
        res.status(500).json("You can't follow yourself!");
    }
});
//unfollow a user
router.put("/:id/unfollow",async (req,res)=>{
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const currUser = await User.findById(req.body.userId);
            if(user.followers.includes(currUser._id)){
                await user.updateOne({ $pull : { followers : req.body.userId} });
                await currUser.updateOne({ $pull : { followings : req.params.id} });
                res.status(200).json("User has been unfollowed");
            }else{
                res.status(403).json("You dont follow this user.");
            }
        }catch(err){
            res.status(500).json(err);
        }
    }else{
        res.status(500).json("You can't unfollow yourself!");
    }
});

router.get("/",(req,res)=>{
    res.send("Hey its user route");
});

module.exports = router;