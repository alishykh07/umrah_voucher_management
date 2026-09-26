import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { requireAuth } from '../middleware/auth.js';
import { imageUpload } from '../middleware/upload.js';

const router = Router();
router.post('/image', requireAuth, imageUpload.single('image'), uploadImage);
export default router;