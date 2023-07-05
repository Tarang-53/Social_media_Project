const router = require("express").Router();
const Post = require("../modules/Post");
const User = require("../modules/User");

//create a post
router.post("/",async (req,res)=>{
    const newPost = new Post(req.body);
    try{
        const savePost = await newPost.save();
        res.status(200).json(savePost);
    } catch(err){
        res.status(500).json(err);
    }
});
//update a post
router.put("/:id",async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId){
            await post.updateOne({$set : req.body});
            res.status(200).json("Post updated successfully.");
        }else{
            res.status(403).json("You can only update your posts!");
        }

    }catch(err){
        res.status(500).json(err);
    }
});

//delete a 
router.delete("/:id",async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId){
            const deleted = post.deleteOne();
            if(deleted)
                res.status(200).json("The post deleted successfully.");
            else
                res.status(401).json("Post not deleted!");
        }else{
            res.status(403).json("You can only delete your posts!");
        }

    }catch(err){
        res.status(500).json(err);
    }
});

//like a post
router.put("/:id/like",async (req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(!post.likes.includes(req.body.userId)){
            await post.updateOne({ $push : { likes : req.body.userId} });
            res.status(200).json("Post has been liked.");
        }else{
            await post.updateOne({ $pull : { likes : req.body.userId} });
            res.status(200).json("Post has been unliked.");
        }
    }catch(err){
        res.status(500).json(err);
    }
});
//get a post
router.get("/:id",async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(post){
            // const {createdAt,updatedAt,__v,...other} = post._doc
            res.status(200).json(post);
        }
        else{
            res.status(404).json("post not found!");
        }
    }catch(err){
        res.status(500).json(err);
    }
});
//get timeline posts
router.get("/timeline/all",async (req,res)=>{
    try{
        const currUser = await User.findById(req.body.userId);
        const userPosts = await Post.find({userId: currUser._id});
        const friendPosts = await Promise.all(
            currUser.followings.map((friendId)=>{
                return Post.find({userId:friendId});
            })
        );
        res.status(200).json(userPosts.concat(...friendPosts));

    }catch(err){
        res.status(500).json(err);
    }
});

module.exports = router;