import Customer from '../models/Customer.js';
import Voucher from '../models/Voucher.js';

const payload = (body) => ({ name: body.name, email: body.email || '', phone: body.phone || '', familyHead: body.familyHead || '', status: body.status === 'inactive' ? 'inactive' : 'active', photo: body.photo || '' });
const serialize = (customer, totalVouchers = 0, lastActivity = customer.updatedAt) => ({ id: customer._id.toString(), name: customer.name, email: customer.email || '', phone: customer.phone || '', familyHead: customer.familyHead || '', status: customer.status, photo: customer.photo || '', totalVouchers, lastActivity });

const syncExistingVoucherCustomers = async () => {
  const voucherCustomers = await Voucher.aggregate([
    { $match: { 'customer.name': { $type: 'string', $ne: '' } } },
    { $sort: { updatedAt: -1 } },
    { $group: { _id: { $toLower: '$customer.name' }, name: { $first: '$customer.name' }, familyHead: { $first: '$customer.familyHead' } } },
  ]);
  const existing = await Customer.find().select('name').lean();
  const knownNames = new Set(existing.map((customer) => customer.name.toLowerCase()));
  const missing = voucherCustomers
    .filter((customer) => customer.name && !knownNames.has(customer._id))
    .map((customer) => ({ name: customer.name.trim(), familyHead: String(customer.familyHead || '').trim(), status: 'active' }));
  if (missing.length) await Customer.insertMany(missing, { ordered: false });
};
const customerStats = async () => {
  const rows = await Voucher.aggregate([{ $group: { _id: { $toLower: '$customer.name' }, total: { $sum: 1 }, lastActivity: { $max: '$updatedAt' } } }]);
  return new Map(rows.map((row) => [row._id, row]));
};

export const listCustomers = async (_req, res, next) => { try { await syncExistingVoucherCustomers(); const [customers, stats] = await Promise.all([Customer.find().sort({ createdAt: -1 }), customerStats()]); res.json({ customers: customers.map((customer) => { const stat = stats.get(customer.name.toLowerCase()); return serialize(customer, stat?.total || 0, stat?.lastActivity || customer.updatedAt); }) }); } catch (error) { next(error); } };
export const createCustomer = async (req, res, next) => { try { const customer = await Customer.create(payload(req.body)); res.status(201).json({ customer: serialize(customer) }); } catch (error) { next(error); } };
export const updateCustomer = async (req, res, next) => { try { const customer = await Customer.findById(req.params.id); if (!customer) return res.status(404).json({ message: 'Customer not found.' }); Object.assign(customer, payload(req.body)); await customer.save(); const stat = (await customerStats()).get(customer.name.toLowerCase()); res.json({ customer: serialize(customer, stat?.total || 0, stat?.lastActivity || customer.updatedAt) }); } catch (error) { next(error); } };
export const deleteCustomer = async (req, res, next) => { try { const customer = await Customer.findById(req.params.id); if (!customer) return res.status(404).json({ message: 'Customer not found.' }); await customer.deleteOne(); res.status(204).end(); } catch (error) { next(error); } };
