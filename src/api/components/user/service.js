import moment from 'moment';
import User from './model.js';
import Followers from './follower.model.js';

export const fetchUser = async (value, field) => {
  try {
    if (!value || !field) return { error: 'Invalid arguments' };
    const user = await User.findOne({ [`${field}`]: value }).lean();
    return user;
  } catch (err) {
    return { error: err.message };
  }
};

export const createUser = async (data) => {
  try {
    data.dob = new Date(data?.dob);
    const user = await User.create(data);
    return user;
  } catch (err) {
    return { error: err.message };
  }
};

export const updateUser = async (data, userId) => {
  try {
    const user = await User.findByIdAndUpdate(userId, data, { new: true });
    return user;
  } catch (err) {
    return { error: err.message };
  }
};

export const fetchFollowings = async (userId) => {
  try {
    const followings = await Followers.find({ 'followers.userId': userId });
    return followings;
  } catch (err) {
    return { error: err.message };
  }
};

export const fetchAllUsers = async (userId) => {
  try {
    const users = await User.find({ _id: { $ne: userId } }).lean();
    const followingsList = await Followers.find({ 'followers.userId': userId });
    users.forEach((el) => {
      const following = followingsList.find((it) => it.userId.toString() == el._id.toString());
      if (following) {
        el.following = true;
      } else {
        el.following = false;
      }
    });
    return users;
  } catch (err) {
    return { error: err.message };
  }
};
