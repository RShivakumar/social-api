import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from './model.js';
import Followers from './follower.model.js';
import Post from '../post/model.js';
import { handleError, handleResponse } from '../../helpers/requestHandler.js';
import { signupValidator, loginValidator, updateProfileValidator } from './validator.js';
import { fetchUser, createUser, updateUser, fetchAllUsers } from './service.js';
import { checkPassword } from '../../helpers/helper.js';
import config from '../../config/config.js';
import messages from '../../config/messages.js';
const ObjectId = mongoose.Types.ObjectId;

export const signup = async (req, res) => {
  try {
    const validation = await signupValidator(req.body);
    if (validation?.error) return handleError({ res, err: validation.message });

    /* Check for username */
    const usernameExist = await fetchUser(req.body.username, 'username');
    if (usernameExist?.error) return handleError({ res, err: usernameExist.error });
    if (usernameExist) return handleError({ res, err: messages.USERNAME_TAKEN, statusCode: 400 });

    /* Check for email */
    const emailExist = await fetchUser(req.body.email, 'email');
    if (emailExist?.error) return handleError({ res, err: emailExist.error });
    if (emailExist) return handleError({ res, err: messages.EMAIL_ALREADY_EXISTS, statusCode: 400 });

    /* Create User */
    const user = await createUser(req.body);
    if (user?.error) return handleError({ res, err: user.error });
    /* Add to Followers Table */
    await Followers.create({ userId: user._id, followers: [] });
    delete user.password;
    return handleResponse({ res, msg: messages.SIGNUP_SUCCESS, data: user });
  } catch (err) {
    return handleError({ res, err: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const validation = await loginValidator(req.body);
    if (validation?.error) return handleError({ res, err: validation.message });
    const { email, password } = req.body;

    /* Fetch user */
    const user = await fetchUser(email, 'email');
    if (user?.error) return handleError({ res, err: user.error });
    if (!user) return handleError({ res, err: messages.NO_USER_FOUND, statusCode: 400 });

    /* Check for password */
    if (!(await checkPassword(password, user.password))) {
      return handleError({ res, err: messages.INCORRECT_CREDENTIALS, statusCode: 400 });
    }

    const tokenVariables = {
      _id: user?._id,
      email: user?.email,
      username: user?.username,
    };

    const token = jwt.sign(tokenVariables, config.jwtSecretKey, {
      expiresIn: req.body?.rememberMe ? '30d' : '1d',
    });
    delete user.password;
    const userData = {
      ...user,
      token,
    };
    return handleResponse({ res, msg: messages.LOGIN_SUCCESS, data: userData });
  } catch (err) {
    return handleError({ res, err: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const validation = await updateProfileValidator(req.body);
    if (validation?.error) return handleError({ res, err: validation.message });
    const __user = req.user;
    // if (req.body?.username) {
    //   const usernameExist = await fetchUser(req.body.username, 'username');
    //   if (usernameExist) return handleError({ res, err: messages.USERNAME_TAKEN, statusCode: 400 });
    // }
    const update = await updateUser(req.body, __user._id);
    if (update?.error) return handleError({ res, err: update.error });
    delete update?.password;
    return handleResponse({ res, msg: messages.PROFILE_UPDATE_SUCCESS, data: update });
  } catch (err) {
    return handleError({ res, err: err.message });
  }
};

export const follow = async (req, res) => {
  try {
    const followId = req.params.id;
    const followUser = await fetchUser(new ObjectId(followId), '_id');
    if (!followUser) {
      return handleError({ res, err: messages.INVALID_REQUEST, statusCode: 400 });
    }
    const __user = req.user;
    const checkFollowing = await Followers.findOne({ userId: followUser._id, 'followers.userId': __user._id });
    if (checkFollowing) return handleError({ res, err: messages.ALREADY_FOLLOWING, statusCode: 400 });
    await Followers.updateOne({ userId: followUser._id }, { $push: { followers: { userId: __user._id, at: new Date() } } });
    return handleResponse({ res, msg: messages.FOLLOWING });
  } catch (err) {
    return handleError({ res, err: err.message });
  }
};

export const unfollow = async (req, res) => {
  try {
    const unfollowId = req.params.id;
    const unfollowUser = await fetchUser(new ObjectId(unfollowId), '_id');
    if (!unfollowUser) {
      return handleError({ res, err: messages.INVALID_REQUEST, statusCode: 400 });
    }
    const __user = req.user;
    console.log(__user._id);
    console.log(unfollowUser._id);
    await Followers.updateOne({ userId: unfollowUser._id }, { $pull: { followers: { userId: __user._id } } });
    return handleResponse({ res, msg: messages.UNFOLLOWED });
  } catch (err) {
    return handleError({ res, err: err.message });
  }
};

export const profile = async (req, res) => {
  try {
    const __user = req.user;
    const followers = await Followers.findOne({ userId: __user._id });
    const followersCount = followers.followers.length ?? 0;
    const following = await Followers.find({ 'followers.userId': __user._id });
    const followingCount = following.length;
    const result = {
      ...__user,
      followers: followersCount,
      following: followingCount,
    };
    return handleResponse({ res, msg: messages.PROFILE, data: result });
  } catch (err) {
    return handleError({ res, err: err.message });
  }
};

export const stats = async (req, res) => {
  try {
    const totalUsers = await User.find({}).count();
    const totalPosts = await Post.find({}).count();
    const userData = await User.aggregate([
      {
        $match: {},
      },
      {
        $lookup: {
          from: 'posts',
          foreignField: 'userId',
          localField: '_id',
          as: 'postsData',
        },
      },
      {
        $addFields: {
          posts: { $size: '$postsData' },
          shared: {
            $map: {
              input: '$postsData',
              as: 'postsData',
              in: {
                $size: '$$postsData.shared',
              },
            },
          },
        },
      },
      {
        $addFields: {
          shared: { $sum: '$shared' },
        },
      },
      {
        $lookup: {
          from: 'followers',
          foreignField: 'userId',
          localField: '_id',
          as: 'followersData',
        },
      },
      {
        $unwind: {
          path: '$followersData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'followers',
          let: { id: '_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$$id', '$followers.userId'],
                },
              },
            },
          ],
          as: 'followings',
        },
      },
      {
        $project: {
          username: 1,
          posts: 1,
          shared: 1,
          followers: { $size: '$followersData.followers' },
        },
      },
    ]);
    let totalShared = 0;
    userData.forEach((el) => {
      totalShared += el.shared;
    });
    const result = {
      userStats: userData,
      totalUsers,
      totalPosts,
      totalShared,
    };
    return handleResponse({ res, data: result });
  } catch (err) {
    return handleError({ res, err: err.message });
  }
};

export const allUsers = async (req, res) => {
  try {
    const __user = req.user;
    const users = await fetchAllUsers(__user._id);
    if (users?.error) return handleError({ res, err: users.error });
    return handleResponse({ res, msg: messages.USERS_LIST, data: users });
  } catch (err) {
    return handleError({ res, err: err.message });
  }
};
