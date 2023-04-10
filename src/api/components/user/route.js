import express from 'express';
import { signup, login, updateProfile, follow, unfollow, profile, stats, allUsers } from './controller.js';
import { authorize } from '../../middlewares/auth.js';
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/stats', stats);
router.use(authorize);
router.get('/all-users', allUsers);
router.put('/profile', updateProfile);
router.post('/follow/:id', follow);
router.post('/unfollow/:id', unfollow);
router.get('/profile', profile);

export default router;
