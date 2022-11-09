const { User, Post, Comment } = require('../models');
const { db } = require('../models/User');
// GET all posts
const postController = {
   getAllPosts(req, res) {
    try {
        const postData = Post.find({})
        .populate({ path: 'comments', select: '-__v' })
        .select('-__v')

        res.status(200).json(postData)
    } catch (err) {
        res.status(500).json(err)
    }
   },

   // GET route by ID
   getPostById({ params }, res) {
    Post.findOne({ _id: params.id })
    .populate({ path: 'comments', select: '-__v' })
    .select('-__v')
    .then(dbPostData => {
        if(!dbPostData) {
            res.status(404).json({ message: 'No Post found' });
            return;
        }
        res.status(200).json(dbPostData);
    })
    .catch(err => {
        console.log(err);
        res.status(400).json(err);
    });
   },

   // POST route
   createPost({ body }, res) {
    Post.create(body)
    .then(dbPostData => {
        User.findOneAndUpdate(
            { _id: body.userId},
            { $push: { posts: dbPostData._id } },
            { new: true }
        )
        .then(dbUserData => {
            if(!dbUserData) {
                res.status(404).json({ message: 'No User found' });
                return;
            }
            res.status(200).json(dbUserData);
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.status(400).json(err));
   },

   updatePost({ params, body }, res) {
    Post.findOneAndUpdate(
        { _id: params.id},
        body,
        { new: true }
    )
    .then(dbPostData => {
        if(!dbPostData) {
            res.status(404).json({ message: 'No thought found with this id' });
            return;
        }
        res.status(200).json(dbPostData);
    })
    .catch(err => res.status(500).json(err));
   },

   // DELETE route
   deletePost({ params }, res) {
    Post.findOneAndDelete({ _id: params.id })
    .then(dbPostData => {
        if(!dbPostData) {
            res.status(404).json({ message: 'No Post found' });
            return;
        }
        User.findByIdAndUpdate(
            { username: dbPostData.username },
            { $pull: { posts: params.id } }
        )
        .then(() => {
            res.json({message: 'Deleted' });
        })
        .catch(err => res.status(500).json(err));
    })
    .catch(err => res.status(500).json(err));
   },

   //POST comments
   addComment({ params, body }, res) {
    Post.findOneAndUpdate(
        { _id: params.postId },
        { $addToSet: { comments: body } },
        {new: true, runValidators: true}
    )
    .then(dbPostData => {
        if(!dbPostData) {
            res.status(404).json({ message: 'No Post Found '});
            return;
        }
        res.status(200).json(dbPostData);
    })
    .catch(err => res.status(500).json(err));
   },
   
   //DELETE comments
   deleteComment({ params, body }, res) {
    Post.findOneAndUpdate(
        { _id: params.postId },
        { $pull: { comments: { commentId: body.commentId } } },
        { new: true, runValidators: true }
    )
    .then(dbPostData => {
        if(!dbPostData) {
            res.status(404).json({ message: 'No Post Found' });
            return;
        }
        res.status(200).json({ message: 'DELETED' });
    })
    .catch(err => res.status(500).json(err));
   },
}

module.exports = postController;
