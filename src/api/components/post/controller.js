import mongoose from 'mongoose';
import { handleResponse, handleError } from '../../helpers/requestHandler.js';
import { createPostValidator } from './validator.js';
import { addPost, fetchPosts, fetchMyPosts, reactOnPost, commentOnPost, replyOnComment, sharePostToFriend, fetchSharedPosts } from './service.js';
import { fetchFollowings } from '../user/service.js';
import messages from '../../config/messages.js';
const ObjectId = mongoose.Types.ObjectId;

export const createPost = async (req, res) => {
  try {
    const files = req.files;
    const mediaPostData = [];
    files.forEach((el) => mediaPostData.push({ url: el.transforms[0].location }));
    req.body.media = mediaPostData;
    const validation = await createPostValidator(req.body);
    if (validation?.error) return handleError({ res, err: validation.message });
    const __user = req.user;
    req.body.userId = __user._id;
    req.body.firstName = __user.firstName;
    req.body.lastName = __user.lastName;
    const post = await addPost(req.body);
    if (post?.error) return handleError({ res, err: post.error });
    return handleResponse({ res, msg: messages.POST_SUCCESS, data: post });
  } catch (err) {
    return handleError({ res, err: err.message });
  }
};

export const listPosts = async (req, res) => {
  try {
    const __user = req.user;
    const followings = await fetchFollowings(__user._id);
    if (followings?.error) return handleError({ res, err: followings.error });
    if (followings.length === 0) return handleResponse({ res, msg: messages.FEED, data: [] });
    const posts = await fetchPosts(followings);
    if (posts?.error) return handleError({ res, err: posts.error });
    return handleResponse({ res, msg: messages.FEED, data: posts });
  } catch (err) {
    return handleError({ res, err: err.message });
  }
};

export const myPosts = async (req, res) => {
  try {
    const __user = req.user;
    const posts = await fetchMyPosts(__user._id);
    if (posts?.error) return handleError({ res, err: posts.error });
    return handleResponse({ res, msg: messages.YOUR_POSTS, data: posts });
  } catch (err) {
    return handleError({ res, err: err.message });
  }
};

export const postReact = async (req, res) => {
  try {
    const __user = req.user;
    const postId = req.params.postId;
    const { like } = req.body;
    const react = await reactOnPost(new ObjectId(postId), like, __user._id);
    if (react?.error) return handleError({ res, err: react.error });
    return handleResponse({ res, msg: like ? 'Liked!' : 'Disliked' });
  } catch (err) {
    return handleError({ res, err: err.message });
  }
};

export const comment = async (req, res) => {
  try {
    const __user = req.user;
    const postId = req.params.postId;
    const { comment } = req.body;
    if (!comment || comment === '') return handleError({ res, err: messages.INVALID_REQUEST, statusCode: 400 });
    const addComment = await commentOnPost(new ObjectId(postId), comment, new ObjectId(__user._id));
    if (addComment?.error) return handleError({ res, err: addComment.error });
    return handleResponse({ res, msg: messages.COMMENT_ADDED });
  } catch (err) {
    return handleError({ res, err: err.message });
  }
};

export const commentReply = async (req, res) => {
  try {
    const __user = req.user;
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const { reply } = req.body;
    if (!reply || reply === '') return handleError({ res, err: messages.INVALID_REQUEST, statusCode: 400 });
    const replied = await replyOnComment(new ObjectId(postId), new Object(commentId), reply, __user._id);
    if (replied?.error) return handleError({ res, err: replied.error });
    return handleResponse({ res, msg: messages.REPLIED });
  } catch (err) {
    return handleError({ res, err: err.message });
  }
};

export const sharePost = async (req, res) => {
  try {
    const __user = req.user;
    const postId = req.params.postId;
    const friendId = req.params.userId;
    const post = await sharePostToFriend(new Object(postId), new Object(friendId), __user._id);
    if (post?.error) return handleError({ res, err: post.error });
    return handleResponse({ res, msg: messages.POST_SHARED });
  } catch (err) {
    return handleError({ res, err: err.message });
  }
};

export const sharedPosts = async (req, res) => {
  try {
    const __user = req.user;
    const userId = req.params.userId;
    const youShared = await fetchSharedPosts(__user._id, new ObjectId(userId));
    const sharedWithYou = await fetchSharedPosts(new ObjectId(userId), __user._id);
    const result = { youShared, sharedWithYou };
    return handleResponse({ res, msg: messages.SHARED_POSTS, data: result });
  } catch (err) {
    return handleError({ res, err: err.message });
  }
};
