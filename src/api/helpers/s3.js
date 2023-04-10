import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3-transform';
import path from 'path';
import sharp from 'sharp';

export const s3 = new AWS.S3();

export const UploadS3 = ({ bucketName }) => {
  return multer({
    storage: multerS3({
      s3: s3,
      bucket: bucketName,
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        const pathExtension = path.extname(file.originalname);
        const fullPath = `${file.originalname.replace(pathExtension, '')}-${Date.now()}${pathExtension}`;
        cb(null, fullPath);
      },
      shouldTransform: function (req, file, cb) {
        cb(null, /^image/i.test(file.mimetype));
      },
      transforms: [
        {
          id: 'toWebp',
          key: (req, file, cb) => {
            const pathExtension = path.extname(file.originalname);
            const fullPath = `${file.originalname.replace(pathExtension, '')}-${Date.now()}.webp`;
            cb(null, fullPath);
          },
          transform: function (req, file, cb) {
            cb(null, sharp().webp());
          },
        },
      ],
    }),
  });
};
