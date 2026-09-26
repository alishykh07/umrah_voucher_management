import { v2 as cloudinary } from 'cloudinary';

const folders = {
  companies: 'umrah-voucher/companies',
  admins: 'umrah-voucher/admins',
  agents: 'umrah-voucher/agents',
  customers: 'umrah-voucher/customers',
  dashboard: 'umrah-voucher/dashboard',
  voucher_header: 'umrah-voucher/vouchers/headers',
  voucher_watermark: 'umrah-voucher/vouchers/watermarks',
  misc: 'umrah-voucher/misc',
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (buffer, folder) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { folder, resource_type: 'image', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] },
    (error, result) => error ? reject(error) : resolve(result),
  );
  stream.end(buffer);
});

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please choose a JPG, PNG, or WEBP image.' });
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(503).json({ message: 'Cloudinary is not configured on the server.' });
    }
    const folder = folders[req.body.folder] || folders.misc;
    const result = await uploadToCloudinary(req.file.buffer, folder);
    res.status(201).json({ url: result.secure_url, publicId: result.public_id, folder, name: req.file.originalname, size: req.file.size });
  } catch (error) {
    next(error);
  }
};