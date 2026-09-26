import { Router } from 'express';
import { createAgent, deleteAgent, listAgents, updateAgent } from '../controllers/agentController.js';
import { allowRoles, requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, allowRoles('admin', 'super_admin'));
router.get('/', listAgents);
router.post('/', createAgent);
router.put('/:id', updateAgent);
router.delete('/:id', deleteAgent);
export default router;
