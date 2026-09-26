import { launchPdfBrowser } from '../services/browser.js';
import Voucher from '../models/Voucher.js';

const escapeHtml = (value) => String(value ?? 'Not provided').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const date = (value) => value ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : 'Not provided';
const fileMonth = (startDate) => {
  const value = startDate ? new Date(startDate + 'T00:00:00') : new Date();
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(value).replace(/\s+/g, '-');
};

export const getReportPdf = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.startDate || req.query.endDate) {
      query.voucherDate = {};
      if (req.query.startDate) query.voucherDate.$gte = new Date(req.query.startDate + 'T00:00:00.000Z');
      if (req.query.endDate) query.voucherDate.$lte = new Date(req.query.endDate + 'T23:59:59.999Z');
    }
    const vouchers = await Voucher.find(query).populate('company', 'name').sort({ voucherDate: -1, createdAt: -1 }).limit(500).lean();
    const counts = { total: vouchers.length, approved: vouchers.filter((item) => item.status === 'APPROVED').length, draft: vouchers.filter((item) => item.status === 'DRAFT').length, cancelled: vouchers.filter((item) => item.status === 'CANCELLED').length, expired: vouchers.filter((item) => item.status === 'EXPIRED').length };
    const from = date(req.query.startDate); const to = date(req.query.endDate);
    const rows = vouchers.map((item, index) => '<tr><td>' + (index + 1) + '</td><td>' + escapeHtml(item.voucherNo) + '</td><td>' + escapeHtml(item.customer?.name) + '</td><td>' + escapeHtml(item.company?.name) + '</td><td><b class="' + String(item.status).toLowerCase() + '">' + escapeHtml(item.status) + '</b></td><td>' + escapeHtml(date(item.voucherDate)) + '</td></tr>').join('') || '<tr><td colspan="6">No vouchers found for this date range.</td></tr>';
    const html = '<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:12mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#17375f;font-size:10px}header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #1478f3;padding-bottom:13px}h1{margin:0;color:#0d3970;font-size:24px}header p{margin:6px 0 0;color:#6380a5}.period{padding:8px 12px;border-radius:7px;background:#eff7ff;color:#285b91;font-weight:bold}.cards{display:grid;grid-template-columns:repeat(5,1fr);gap:9px;margin:16px 0}.card{padding:11px;border:1px solid #dce9f7;border-radius:7px;background:#fff}.card small,.card b{display:block}.card small{color:#6e89a9}.card b{margin-top:6px;color:#102f5b;font-size:21px}.approved{color:#109e68}.draft{color:#d68812}.cancelled{color:#dc3e54}.expired{color:#7f42cc}h2{margin:17px 0 8px;font-size:14px}table{width:100%;border-collapse:collapse}th{padding:8px;background:#eef6ff;color:#31577f;text-align:left}td{padding:8px;border-bottom:1px solid #e5edf7}td b{font-size:9px}.footer{position:fixed;bottom:0;left:0;right:0;border-top:1px solid #dce8f5;padding-top:5px;color:#7891ae;font-size:8px;text-align:center}</style></head><body><header><div><h1>Umrah Voucher Report</h1><p>Voucher Management System</p></div><div class="period">' + escapeHtml(from) + ' to ' + escapeHtml(to) + '</div></header><section class="cards"><div class="card"><small>Total Vouchers</small><b>' + counts.total + '</b></div><div class="card"><small>Approved</small><b class="approved">' + counts.approved + '</b></div><div class="card"><small>Draft</small><b class="draft">' + counts.draft + '</b></div><div class="card"><small>Cancelled</small><b class="cancelled">' + counts.cancelled + '</b></div><div class="card"><small>Expired</small><b class="expired">' + counts.expired + '</b></div></section><h2>Voucher Details</h2><table><thead><tr><th>#</th><th>Voucher No</th><th>Customer</th><th>Company</th><th>Status</th><th>Voucher Date</th></tr></thead><tbody>' + rows + '</tbody></table><div class="footer">Generated on ' + escapeHtml(date(new Date())) + ' · Umrah Voucher Management System</div></body></html>';
    const browser = await launchPdfBrowser();
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      const pdf = Buffer.from(await page.pdf({ format: 'A4', printBackground: true }));
      const filename = 'Voucher-Report-' + fileMonth(req.query.startDate) + '.pdf';
      res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="' + filename + '"', 'Content-Length': pdf.length });
      res.send(pdf);
    } finally { await browser.close(); }
  } catch (error) { next(error); }
};