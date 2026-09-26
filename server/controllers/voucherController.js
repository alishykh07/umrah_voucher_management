import crypto from 'crypto';
import QRCode from 'qrcode';
import Counter from '../models/Counter.js';
import Voucher from '../models/Voucher.js';
import Customer from '../models/Customer.js';
import { renderVoucherPdf } from '../services/pdfService.js';

const VOUCHER_PREFIX = 'UV-';

const escapeRegex = (value) => String(value).replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
const syncVoucherCustomer = async (customer) => {
  const name = String(customer?.name || '').trim();
  if (!name) return;
  const familyHead = String(customer?.familyHead || '').trim();
  const email = String(customer?.email || '').trim().toLowerCase();
  const phone = String(customer?.phone || '').trim();
  const photo = String(customer?.photo || '').trim();
  const existing = await Customer.findOne({ name: new RegExp('^' + escapeRegex(name) + '$', 'i') });
  if (!existing) {
    await Customer.create({ name, familyHead, email, phone, photo, status: 'active' });
  } else {
    if (!existing.familyHead && familyHead) existing.familyHead = familyHead;
    if (!existing.email && email) existing.email = email;
    if (!existing.phone && phone) existing.phone = phone;
    if (!existing.photo && photo) existing.photo = photo;
    await existing.save();
  }
};

const numberFromVoucher = (voucherNo) => Number(String(voucherNo || '').replace(/^UV-/, '')) || 0;

const ensureCounter = async () => {
  const latest = await Voucher.findOne({ voucherNo: /^UV-\d+$/ }).sort({ voucherNo: -1 }).select('voucherNo').lean();
  const sequence = Math.max(200000, numberFromVoucher(latest?.voucherNo));
  await Counter.updateOne(
    { key: 'voucherNo' },
    { $setOnInsert: { key: 'voucherNo' }, $max: { sequence } },
    { upsert: true },
  );
};

const nextNumber = async () => {
  await ensureCounter();
  const counter = await Counter.findOneAndUpdate(
    { key: 'voucherNo' },
    { $inc: { sequence: 1 } },
    { new: true },
  );
  return `${VOUCHER_PREFIX}${counter.sequence}`;
};

const previewNumber = async () => {
  await ensureCounter();
  const counter = await Counter.findOne({ key: 'voucherNo' }).lean();
  return `${VOUCHER_PREFIX}${counter.sequence + 1}`;
};

const cleanRows = (rows, fields) => (Array.isArray(rows) ? rows : [])
  .filter((row) => fields.some((field) => row?.[field] !== '' && row?.[field] !== undefined && row?.[field] !== null))
  .map((row) => Object.fromEntries(Object.entries(row).filter(([, value]) => value !== '' && value !== undefined && value !== null)));

const nonNegativeNumber = (value) => Math.max(0, Number(value) || 0);

const payload = (body) => {
  const adultCount = nonNegativeNumber(body.adultCount);
  const childCount = nonNegativeNumber(body.childCount);
  const infantCount = nonNegativeNumber(body.infantCount);
  const accommodationRows = cleanRows(body.accommodation, ['city', 'hotelName']);
  const mutamerRows = cleanRows(body.mutamers, ['name', 'passportNo']);
  const incompleteMutamer = mutamerRows.find((row) => !String(row.name || '').trim());
  if (incompleteMutamer) { const error = new Error('Every Mutamer row with passport or traveller details must include Full Name. Add the name or remove that row.'); error.statusCode = 400; throw error; }
  const managementContacts = body.managementContacts || {};
  const contactBlocks = (Array.isArray(body.contactBlocks) ? body.contactBlocks : [])
    .map((block) => ({ title: String(block?.title || '').trim(), lines: (Array.isArray(block?.lines) ? block.lines : []).map((line) => String(line || '').trim()).filter(Boolean) }))
    .filter((block) => block.title || block.lines.length);
  const voucherHeader = body.voucherHeader || {};
  return {
  company: body.company,
  bookingNo: body.bookingNo || '',
  manualServiceNo: body.manualServiceNo || '',
  branch: body.branch || '',
  groupNo: body.groupNo || '',
  groupName: body.groupName || '',
  adultCount,
  childCount,
  infantCount,
  separateBeds: nonNegativeNumber(body.separateBeds),
  totalPax: adultCount + childCount + infantCount,
  totalNights: accommodationRows.reduce((total, row) => total + nonNegativeNumber(row.nights), 0),
  travelBy: body.travelBy || '',
  specialInstructions: body.specialInstructions || '',
  managementContacts: {
    makkah: { name: managementContacts.makkah?.name || '', phone: managementContacts.makkah?.phone || '' },
    madinah: { name: managementContacts.madinah?.name || '', phone: managementContacts.madinah?.phone || '' },
    transport: { name: managementContacts.transport?.name || '', phone: managementContacts.transport?.phone || '' },
  },
  contactBlocks,
  voucherHeader: {
    rightLogo: voucherHeader.rightLogo || '',
    rightTitle: voucherHeader.rightTitle || '',
    rightSubtitle: voucherHeader.rightSubtitle || '',
    rightContact: voucherHeader.rightContact || '',
  },
  watermarkUrl: body.watermarkUrl || '',
  voucherDate: body.voucherDate,
  package: body.package || '',
  status: ['DRAFT', 'APPROVED', 'CANCELLED'].includes(body.status) ? body.status : 'DRAFT',
  customer: body.customer || {},
  mutamers: mutamerRows,
  accommodation: accommodationRows,
  flights: cleanRows(body.flights, ['flightNo', 'sector']),
  transport: cleanRows(body.transport, ['transporter', 'route']),
  termsAndConditions: (Array.isArray(body.termsAndConditions) ? body.termsAndConditions : []).map((term) => String(term).trim()).filter(Boolean),
};
};
export const listVouchers = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.company) query.company = req.query.company;
    if (req.query.package) query.package = req.query.package;
    if (req.query.search?.trim()) {
      const search = new RegExp(req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ voucherNo: search }, { bookingNo: search }, { 'customer.name': search }, { 'customer.familyHead': search }];
    }
    if (req.query.startDate || req.query.endDate) {
      query.voucherDate = {};
      if (req.query.startDate) query.voucherDate.$gte = new Date(`${req.query.startDate}T00:00:00.000Z`);
      if (req.query.endDate) query.voucherDate.$lte = new Date(`${req.query.endDate}T23:59:59.999Z`);
    }
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
    const [total, vouchers] = await Promise.all([
      Voucher.countDocuments(query),
      Voucher.find(query).populate('company', 'name slug logo').populate('createdBy', 'name role').populate('cancelledBy', 'name role').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    ]);
    res.json({ vouchers, pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) } });
  } catch (e) { next(e); }
};
export const getVoucher = async (req, res, next) => { try { const voucher = await Voucher.findById(req.params.id).populate('company', 'name slug logo phone whatsapp email address website status'); if (!voucher) return res.status(404).json({ message: 'Voucher not found.' }); res.json({ voucher }); } catch (e) { next(e); } };
export const getNextVoucherNumber = async (req, res, next) => { try { res.json({ voucherNo: await previewNumber() }); } catch (e) { next(e); } };
export const createVoucher = async (req, res, next) => { try { const data = payload(req.body); const isCancelled = data.status === 'CANCELLED'; const voucher = await Voucher.create({ ...data, voucherNo: await nextNumber(), qrToken: crypto.randomBytes(32).toString('base64url'), createdBy: req.user._id, updatedBy: req.user._id, ...(isCancelled ? { cancelledAt: new Date(), cancelledBy: req.user._id, cancellationReason: 'Cancelled at creation' } : {}) }); await syncVoucherCustomer(data.customer); res.status(201).json({ voucher: await voucher.populate('company', 'name slug') }); } catch (e) { next(e); } };
export const updateVoucher = async (req, res, next) => { try { const voucher = await Voucher.findById(req.params.id); if (!voucher) return res.status(404).json({ message: 'Voucher not found.' }); if (voucher.status !== 'DRAFT') return res.status(409).json({ message: 'Only draft vouchers can be edited.' }); Object.assign(voucher, payload(req.body), { updatedBy: req.user._id }); await voucher.save(); await syncVoucherCustomer(voucher.customer); await voucher.populate('company', 'name slug'); res.json({ voucher }); } catch (e) { next(e); } };
export const deleteVoucher = async (req, res, next) => { try { const voucher = await Voucher.findById(req.params.id); if (!voucher) return res.status(404).json({ message: 'Voucher not found.' }); if (voucher.status !== 'DRAFT') return res.status(409).json({ message: 'Only draft vouchers can be deleted.' }); await voucher.deleteOne(); res.status(204).end(); } catch (error) { next(error); } };
export const changeStatus = (status) => async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Voucher not found.' });
    if (status === 'APPROVED' && voucher.status !== 'DRAFT') return res.status(409).json({ message: 'Only draft vouchers can be approved.' });
    if (status === 'CANCELLED' && voucher.status !== 'APPROVED') return res.status(409).json({ message: 'Only approved vouchers can be cancelled.' });
    voucher.status = status;
    voucher.updatedBy = req.user._id;
    if (status === 'CANCELLED') { voucher.cancelledAt = new Date(); voucher.cancelledBy = req.user._id; voucher.cancellationReason = voucher.cancellationReason || 'Cancelled by administrator'; }
    await voucher.save();
    await voucher.populate('company', 'name slug');
    res.json({ voucher });
  } catch (e) { next(e); }
};
export const getQr = async (req, res, next) => { try { const voucher = await Voucher.findById(req.params.id).populate('company', 'slug'); if (!voucher) return res.status(404).json({ message: 'Voucher not found.' }); const base = process.env.CLIENT_URL || 'http://localhost:5173'; const url = `${base}/voucher/${voucher.company.slug}/${voucher.qrToken}`; res.json({ url, qrCode: await QRCode.toDataURL(url, { width: 320, margin: 1 }) }); } catch (e) { next(e); } };
export const getVoucherPdf = async (req, res, next) => { try { const voucher = await Voucher.findById(req.params.id).populate('company', 'name slug logo phone whatsapp email address website'); if (!voucher) return res.status(404).json({ message: 'Voucher not found.' }); const base = process.env.CLIENT_URL || 'http://localhost:5173'; const url = `${base}/voucher/${voucher.company.slug}/${voucher.qrToken}`; const qrCode = await QRCode.toDataURL(url, { width: 360, margin: 1 }); const pdf = await renderVoucherPdf(voucher, qrCode); res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${voucher.voucherNo}.pdf"`, 'Content-Length': pdf.length }); res.send(pdf); } catch (error) { next(error); } };
