import Company from '../models/Company.js';
import Voucher from '../models/Voucher.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const pageSize = 5;
    const voucherFilter = req.query.date ? {
      voucherDate: {
        $gte: new Date(`${req.query.date}T00:00:00.000Z`),
        $lt: new Date(`${req.query.date}T23:59:59.999Z`),
      },
    } : {};
    const [totalVouchers, approved, drafts, cancelled, expired, companies, recentVouchers, recentCompanies] = await Promise.all([
      Voucher.countDocuments(voucherFilter), Voucher.countDocuments({ ...voucherFilter, status: 'APPROVED' }), Voucher.countDocuments({ ...voucherFilter, status: 'DRAFT' }), Voucher.countDocuments({ ...voucherFilter, status: 'CANCELLED' }), Voucher.countDocuments({ ...voucherFilter, status: 'EXPIRED' }), Company.countDocuments(),
      Voucher.find(voucherFilter).populate('company', 'name').sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize), Company.find().sort({ createdAt: -1 }).limit(5),
    ]);
    res.json({ stats: { totalVouchers, approved, drafts, cancelled, expired, companies }, recentVouchers, recentCompanies, recentVouchersPage: { page, pageSize, total: totalVouchers, totalPages: Math.max(1, Math.ceil(totalVouchers / pageSize)) } });
  } catch (error) { next(error); }
};
