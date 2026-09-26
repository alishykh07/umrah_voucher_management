import multer from 'multer';

const fileFilter = (_req, file, callback) => {
  if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return callback(null, true);
  callback(new Error('Only JPG, PNG, and WEBP images are allowed.'));
};

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});