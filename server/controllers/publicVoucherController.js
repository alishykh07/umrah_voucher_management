import Voucher from '../models/Voucher.js';
import QRCode from 'qrcode';

const publicVoucher = (voucher) => ({
  voucherNo: voucher.voucherNo,
  bookingNo: voucher.bookingNo,
  manualServiceNo: voucher.manualServiceNo,
  branch: voucher.branch,
  groupNo: voucher.groupNo,
  groupName: voucher.groupName,
  adultCount: voucher.adultCount,
  childCount: voucher.childCount,
  infantCount: voucher.infantCount,
  separateBeds: voucher.separateBeds,
  totalPax: voucher.totalPax,
  totalNights: voucher.totalNights,
  travelBy: voucher.travelBy,
  specialInstructions: voucher.specialInstructions,
  managementContacts: voucher.managementContacts,
  contactBlocks: voucher.contactBlocks,
  voucherHeader: voucher.voucherHeader,
  watermarkUrl: voucher.watermarkUrl,
  voucherDate: voucher.voucherDate,
  package: voucher.package,
  status: voucher.status,
  customer: voucher.customer,
  mutamers: voucher.mutamers,
  accommodation: voucher.accommodation,
  flights: voucher.flights,
  transport: voucher.transport,
  termsAndConditions: voucher.termsAndConditions,
  company: {
    name: voucher.company.name,
    slug: voucher.company.slug,
    logo: voucher.company.logo,
    phone: voucher.company.phone,
    whatsapp: voucher.company.whatsapp,
    email: voucher.company.email,
    address: voucher.company.address,
    website: voucher.company.website,
  },
});

export const getPublicVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findOne({ qrToken: req.params.token })
      .populate('company', 'name slug logo phone whatsapp email address website status');
    if (!voucher || voucher.company?.slug !== req.params.companySlug) return res.status(404).json({ message: 'Voucher not found or this link is invalid.' });
    const base = process.env.CLIENT_URL || 'http://localhost:5173';
    const publicUrl = `${base}/voucher/${voucher.company.slug}/${voucher.qrToken}`;
    res.json({ voucher: publicVoucher(voucher), qrCode: await QRCode.toDataURL(publicUrl, { width: 320, margin: 1 }) });
  } catch (error) { next(error); }
};
