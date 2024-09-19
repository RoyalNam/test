import express from 'express';
import postRouter from './posts.mjs';
import authRouter from './auth.mjs';
import userRouter from './users.mjs';
import followRouter from './follow.mjs';
import commentRouter from './comments.mjs';
import messageRouter from './message.mjs';
import uploadRouter from './uploadImage.mjs';

const router = express.Router();

router.use('/auth', authRouter);
router.use(userRouter);
router.use(postRouter);
router.use(followRouter);
router.use(commentRouter);
router.use(messageRouter);
router.use(uploadRouter);

export default router;
