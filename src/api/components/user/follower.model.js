import mongoose from 'mongoose';
import db from '../../connections/dbMaster.js';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const followersSchema = new Schema(
  {
    userId: { type: ObjectId, ref: 'users' },
    followers: [
      {
        userId: { type: ObjectId, ref: 'users' },
        at: { type: Date },
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
    collection: 'followers',
  }
);

export default db.model('followers', followersSchema);
