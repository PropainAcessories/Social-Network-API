const router = require('express').Router();
const {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    addComment,
    deleteComment
} = require('../../controllers/post-controller');

router
    .route('/')
    .get(getAllPosts)
    .post(createPost);

router
    .route('/:id')
    .get(getPostById)
    .put(updatePost)
    .delete(deletePost);

router.route('/:postId/comments/')
    .post(addComment)
    .delete(deleteComment)

module.exports = router;
