import express from 'express';
import cookieParser from 'cookie-parser';
import apiLog from 'morgan';
import indexRouter from './components/indexRoute.js';
import cors from 'cors';
const app = express();

app.use(apiLog('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use('/api/v1', indexRouter);

// error handler
app.use((err, req, res, next) => {
  console.log('Inside Error handling');
  res.status(err.status).send({
    error: {
      status: err.status || 500,
      msg: err.message || 'Internal Server Error',
      data: err.stack,
    },
  });
});

export default app;
