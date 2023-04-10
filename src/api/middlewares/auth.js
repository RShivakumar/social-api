import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import messages from '../config/messages.js';
import User from '../components/user/model.js';
import { handleError } from '../helpers/requestHandler.js';
const ObjectId = mongoose.Types.ObjectId;

export const authorize = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return handleError({
        res,
        statusCode: 401,
        err: messages.UNAUTHORIZED_TOKEN,
      });
    }
    const token = req.headers.authorization.split(' ')[1];
    const verification = jwt.verify(token, config.jwtSecretKey);
    if (verification) {
      const user = await User.findOne({ _id: verification._id }).lean();
      if (!user) return handleError({ res, err: messages.UNAUTHORIZED_ACCESS, statusCode: 401 });
      req.user = user;
    } else {
      return handleError({ res, err: messages.UNAUTHORIZED_ACCESS, statusCode: 401 });
    }
    return next();
  } catch (err) {
    return handleError({ res, err: err.message });
  }
};
