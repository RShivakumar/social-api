import express from 'express';
const router = express.Router();
import userRouter from './user/route.js';
import postRouter from './post/route.js';

router.use('/user', userRouter);
router.use('/post', postRouter);

export default router;
