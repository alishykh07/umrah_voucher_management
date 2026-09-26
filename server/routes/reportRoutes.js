import { Router } from 'express';
import { getReportPdf } from '../controllers/reportController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.get('/pdf', getReportPdf);
export default router;