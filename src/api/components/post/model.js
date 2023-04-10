import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import db from '../../connections/dbMaster.js';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const postSchema = new Schema(
  {
    userId: { type: ObjectId, ref: 'users' },
    caption: { type: String, required: false },
    firstName: { type: String, ref: 'users' },
    lastName: { type: String, ref: 'users' },
    media: [
      {
        url: {
          type: String,
          trim: true,
        },
      },
    ],
    likes: [{ type: ObjectId, ref: 'users' }],
    comments: [
      {
        user: { type: ObjectId, ref: 'users' },
        text: { type: String },
        at: { type: Date, default: new Date() },
        replies: [
          {
            user: { type: String },
            text: { type: String },
            at: { type: Date, default: new Date() },
          },
        ],
      },
    ],
    shared: [
      {
        user: { type: ObjectId, ref: 'users' },
        at: { type: Date, default: new Date() },
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
    collection: 'posts',
  }
);

export default db.model('posts', postSchema);
