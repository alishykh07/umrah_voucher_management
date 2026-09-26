import { Router } from 'express';
import { getPublicVoucher } from '../controllers/publicVoucherController.js';

const router = Router();
router.get('/vouchers/:companySlug/:token', getPublicVoucher);

export default router;
