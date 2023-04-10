import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import db from '../../connections/dbMaster.js';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const userSchema = new Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    passwordUpdatedAt: {
      type: Date,
    },
    username: { type: String, required: true },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    dob: {
      type: Date,
    },
    countryCode: {
      type: String,
    },
    mobileNumber: {
      type: Number,
    },
    gender:{
      type:String,
    },
    country: {
      type: String,
      trim: true,
    },
    profilePic: String,
    bio: { type: String, default: 'new User' },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: 'users',
  }
);

userSchema.pre('save', async function savePassword(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  return next();
});

userSchema.methods.checkPassword = async (enteredPassword) => {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default db.model('users', userSchema);
