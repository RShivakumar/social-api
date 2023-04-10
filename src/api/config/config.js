import dotenv from 'dotenv';
dotenv.config();

const config = {
  db: {
    str: process.env.DB_STRING,
  },
  jwtSecretKey: process.env.JWT_SECRET_KEY,
};

export default config;
