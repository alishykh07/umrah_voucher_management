import { Router } from 'express';
import { createCustomer, deleteCustomer, listCustomers, updateCustomer } from '../controllers/customerController.js';
import { allowRoles, requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.get('/', listCustomers);
router.post('/', allowRoles('admin'), createCustomer);
router.put('/:id', allowRoles('admin'), updateCustomer);
router.delete('/:id', allowRoles('admin'), deleteCustomer);
export default router;
