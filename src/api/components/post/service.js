import Post from './model.js';
import User from '../user/model.js';

export const addPost = async (data) => {
  try {
    const result = await Post.create(data);
    return result;
  } catch (err) {
    return { error: err.message };
  }
};

export const fetchPosts = async (followings) => {
  try {
    const followingsId = [];
    followings?.forEach((item) => {
      followingsId.push(item.userId);
    });
    if (followingsId.length === 0) return [];
    const posts = await Post.find({ userId: { $in: followingsId } });
    return posts;
  } catch (err) {
    return { error: err.message };
  }
};

export const fetchMyPosts = async (userId) => {
  try {
    const posts = await Post.find({ userId });
    return posts;
  } catch (err) {
    return { error: err.message };
  }
};

export const reactOnPost = async (postId, like, userId) => {
  try {
    const post = await Post.findOne({ _id: postId });
    if (!post) return { error: 'No post found' };
    if (like) await Post.updateOne({ _id: postId }, { $push: { likes: userId } });
    else await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
    return true;
  } catch (err) {
    return { error: err.message };
  }
};

export const commentOnPost = async (postId, comment, userId) => {
  try {
    const post = await Post.findOne({ _id: postId });
    if (!post) return { error: 'No post found' };
    const commented = await Post.updateOne({ _id: postId }, { $push: { comments: { user: userId, text: comment, replies: [] } } });
    return commented;
  } catch (err) {
    return { error: err.message };
  }
};

export const replyOnComment = async (postId, commentId, reply, userId) => {
  try {
    const post = await Post.findOne({ _id: postId });
    if (!post) return { error: 'No post found' };

    const commentExist = await Post.findOne({ 'comments._id': commentId });
    if (!commentExist) return { error: 'No comment found' };

    const replied = await Post.updateOne({ _id: postId, 'comments._id': commentId }, { $push: { 'comments.$.replies': { user: userId, text: reply, at: new Date() } } });
    return replied;
  } catch (err) {
    return { error: err.message };
  }
};

export const sharePostToFriend = async (postId, friendId, userId) => {
  try {
    const post = await Post.findOne({ _id: postId });
    if (!post) return { error: 'No post found' };

    const user = await User.findOne({ _id: friendId });
    if (!user) return { error: 'No user found' };

    const shared = await Post.updateOne({ _id: postId }, { $push: { shared: { user: friendId } } });
    return shared;
  } catch (err) {
    return { error: err.message };
  }
};

export const fetchSharedPosts = async (from, to) => {
  try {
    const posts = Post.find({ userId: from, 'shared.user': to });
    return posts;
  } catch (err) {
    return { error: err.message };
  }
};
