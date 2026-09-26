import { Router } from 'express';
import { createAdmin, deleteAdmin, getBranding, listAdmins, updateAdmin, updateBranding, updateProfile } from '../controllers/settingsController.js';
import { allowRoles, requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.get('/branding', getBranding);
router.use(allowRoles('super_admin'));
router.patch('/branding', updateBranding);
router.patch('/profile', updateProfile);
router.get('/admins', listAdmins);
router.post('/admins', createAdmin);
router.put('/admins/:id', updateAdmin);
router.delete('/admins/:id', deleteAdmin);
export default router;