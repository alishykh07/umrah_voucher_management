import { Router } from 'express';
import { changeStatus, createVoucher, deleteVoucher, getNextVoucherNumber, getQr, getVoucher, getVoucherPdf, listVouchers, updateVoucher } from '../controllers/voucherController.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router(); router.use(requireAuth); router.get('/', listVouchers); router.get('/next-number', getNextVoucherNumber); router.post('/', createVoucher); router.get('/:id', getVoucher); router.get('/:id/pdf', getVoucherPdf); router.put('/:id', updateVoucher); router.delete('/:id', deleteVoucher); router.patch('/:id/approve', changeStatus('APPROVED')); router.patch('/:id/cancel', changeStatus('CANCELLED')); router.get('/:id/qr', getQr); export default router;
