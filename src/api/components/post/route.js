import express from 'express';
const router = express.Router();
import { authorize } from '../../middlewares/auth.js';
import { createPost, listPosts, myPosts, postReact, comment, commentReply, sharePost, sharedPosts } from './controller.js';
import { UploadS3 } from '../../helpers/s3.js';

const uploadS3 = UploadS3({
  bucketName: 'media-post',
});

router.use(authorize);
router.post('/create-post', uploadS3.array('post', 4), createPost);
router.get('/list-posts', listPosts);
router.get('/my-posts', myPosts);
router.post('/post-react/:postId', postReact);
router.post('/comment/:postId', comment);
router.post('/comment-reply/:postId/:commentId', commentReply);
router.post('/share-post/:postId/:userId', sharePost);
router.get('/shared-posts/:userId', sharedPosts);

export default router;
