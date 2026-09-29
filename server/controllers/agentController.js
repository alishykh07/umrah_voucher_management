import crypto from 'crypto';
import User from '../models/User.js';
import Voucher from '../models/Voucher.js';

const publicAgent = (agent, stats = {}) => ({ ...agent.toPublicJSON(), company: agent.company && typeof agent.company === 'object' ? { _id: agent.company._id, name: agent.company.name, slug: agent.company.slug } : agent.company, totalVouchers: stats.total || 0, drafts: stats.drafts || 0, approved: stats.approved || 0, cancelled: stats.cancelled || 0 });

const agentPayload = (body) => ({ name: body.name, email: body.email, role: 'staff', status: body.status === 'inactive' ? 'inactive' : 'active', phone: body.phone || '', company: body.company || undefined, profilePhoto: body.profilePhoto || '' });

const voucherStats = async () => {
  const rows = await Voucher.aggregate([{ $group: { _id: '$createdBy', total: { $sum: 1 }, drafts: { $sum: { $cond: [{ $eq: ['$status', 'DRAFT'] }, 1, 0] } }, approved: { $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] } }, cancelled: { $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] } } } }]);
  return new Map(rows.map((row) => [String(row._id), row]));
};

export const listAgents = async (_req, res, next) => { try { const [agents, stats] = await Promise.all([User.find({ role: 'staff' }).populate('company', 'name slug').sort({ createdAt: -1 }), voucherStats()]); res.json({ agents: agents.map((agent) => publicAgent(agent, stats.get(String(agent._id)))) }); } catch (error) { next(error); } };
export const createAgent = async (req, res, next) => { try { const agent = await User.create({ ...agentPayload(req.body), password: crypto.randomBytes(32).toString('hex') }); await agent.populate('company', 'name slug'); res.status(201).json({ agent: publicAgent(agent) }); } catch (error) { next(error); } };
export const updateAgent = async (req, res, next) => { try { const agent = await User.findById(req.params.id); if (!agent) return res.status(404).json({ message: 'Agent not found.' }); if (String(agent._id) === String(req.user._id) && req.body.status === 'inactive') return res.status(400).json({ message: 'You cannot deactivate your own account.' }); Object.assign(agent, agentPayload(req.body)); await agent.save(); await agent.populate('company', 'name slug'); res.json({ agent: publicAgent(agent) }); } catch (error) { next(error); } };
export const deleteAgent = async (req, res, next) => { try { const agent = await User.findById(req.params.id); if (!agent) return res.status(404).json({ message: 'Agent not found.' }); if (String(agent._id) === String(req.user._id)) return res.status(400).json({ message: 'You cannot delete your own account.' }); const vouchers = await Voucher.countDocuments({ referredByAgent: agent._id }); if (vouchers) return res.status(409).json({ message: 'This agent has voucher history. Set the agent to inactive instead.' }); await agent.deleteOne(); res.status(204).end(); } catch (error) { next(error); } };
