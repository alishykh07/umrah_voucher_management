import User from '../models/User.js';
import SystemSetting from '../models/SystemSetting.js';

const toPublic = (user) => user.toPublicJSON();
const values = (body) => ({ name: String(body.name || '').trim(), email: String(body.email || '').trim().toLowerCase(), status: body.status === 'inactive' ? 'inactive' : 'active', phone: String(body.phone || '').trim(), profilePhoto: String(body.profilePhoto || '').trim() });

export const listAdmins = async (req, res, next) => { try { const superAdminExists = await User.exists({ role: 'super_admin' }); if (!superAdminExists) await User.updateOne({ _id: req.user._id, role: 'admin' }, { $set: { role: 'super_admin' } }); const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } }).sort({ createdAt: -1 }); res.json({ admins: admins.map(toPublic) }); } catch (error) { next(error); } };
export const createAdmin = async (req, res, next) => { try { const data = values(req.body); if (!data.name || !data.email || String(req.body.password || '').length < 8) return res.status(400).json({ message: 'Username, email and a password of at least 8 characters are required.' }); const admin = await User.create({ ...data, password: req.body.password, role: 'admin' }); res.status(201).json({ admin: toPublic(admin) }); } catch (error) { next(error); } };
export const updateAdmin = async (req, res, next) => { try { const admin = await User.findOne({ _id: req.params.id, role: { $in: ['admin', 'super_admin'] } }).select('+password'); if (!admin) return res.status(404).json({ message: 'Admin not found.' }); if (String(admin._id) === String(req.user._id) && req.body.status === 'inactive') return res.status(400).json({ message: 'You cannot deactivate your own account.' }); Object.assign(admin, values(req.body)); if (req.body.password) { if (String(req.body.password).length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' }); admin.password = req.body.password; } await admin.save(); res.json({ admin: toPublic(admin) }); } catch (error) { next(error); } };
export const deleteAdmin = async (req, res, next) => { try { const admin = await User.findOne({ _id: req.params.id, role: { $in: ['admin', 'super_admin'] } }); if (!admin) return res.status(404).json({ message: 'Admin not found.' }); if (String(admin._id) === String(req.user._id)) return res.status(400).json({ message: 'You cannot delete your own account.' }); await admin.deleteOne(); res.status(204).end(); } catch (error) { next(error); } };
export const updateProfile = async (req, res, next) => { try { const user = await User.findById(req.user._id).select('+password'); const data = values(req.body); if (!data.name || !data.email) return res.status(400).json({ message: 'Username and email are required.' }); Object.assign(user, data); if (req.body.password) { if (String(req.body.password).length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' }); user.password = req.body.password; } await user.save(); res.json({ user: toPublic(user) }); } catch (error) { next(error); } };
const defaultBranding = { dashboardName: 'Umrah Voucher', dashboardSubtitle: 'Management System', logoUrl: '', sidebarColor: '#061c40', sidebarTextColor: '#d4e4fc', appTextColor: '#112e59' };
const color = (value, fallback) => /^#[0-9a-fA-F]{6}$/.test(String(value || '')) ? String(value) : fallback;
const brandingValues = (body) => ({
  dashboardName: String(body.dashboardName || defaultBranding.dashboardName).trim().slice(0, 100) || defaultBranding.dashboardName,
  dashboardSubtitle: String(body.dashboardSubtitle || '').trim().slice(0, 100),
  logoUrl: String(body.logoUrl || '').trim().slice(0, 2048),
  sidebarColor: color(body.sidebarColor, defaultBranding.sidebarColor),
  sidebarTextColor: color(body.sidebarTextColor, defaultBranding.sidebarTextColor),
  appTextColor: color(body.appTextColor, defaultBranding.appTextColor),
});
const publicBranding = (setting) => ({ ...defaultBranding, ...(setting ? setting.toObject ? setting.toObject() : setting : {}) });

export const getBranding = async (_req, res, next) => { try { const setting = await SystemSetting.findOne({ key: 'dashboard' }); res.json({ branding: publicBranding(setting) }); } catch (error) { next(error); } };
export const updateBranding = async (req, res, next) => { try { const setting = await SystemSetting.findOneAndUpdate({ key: 'dashboard' }, { $set: brandingValues(req.body) }, { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }); res.json({ branding: publicBranding(setting) }); } catch (error) { next(error); } };