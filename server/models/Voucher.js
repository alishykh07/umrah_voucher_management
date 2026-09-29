import mongoose from 'mongoose';

const person = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  passportNo: { type: String, trim: true },
  gender: { type: String, trim: true },
  paxType: { type: String, trim: true },
  bedType: { type: String, trim: true },
  visaNo: { type: String, trim: true },
  ticketNo: { type: String, trim: true },
  pnr: { type: String, trim: true },
}, { _id: false });

const accommodation = new mongoose.Schema({
  city: { type: String, trim: true },
  hotelName: { type: String, trim: true },
  view: { type: String, trim: true },
  mealPlan: { type: String, trim: true },
  confirmationNo: { type: String, trim: true },
  roomType: { type: String, trim: true },
  qty: { type: Number, min: 0 },
  checkIn: Date,
  checkOut: Date,
  nights: { type: Number, min: 0 },
}, { _id: false });

const flight = new mongoose.Schema({
  leg: { type: String, trim: true },
  flightNo: { type: String, trim: true },
  sector: { type: String, trim: true },
  date: Date,
  etd: { type: String, trim: true },
  eta: { type: String, trim: true },
}, { _id: false });

const transport = new mongoose.Schema({
  travelDate: Date,
  transporter: { type: String, trim: true },
  transportType: { type: String, trim: true },
  route: { type: String, trim: true },
  description: { type: String, trim: true },
}, { _id: false });

const managementContact = new mongoose.Schema({
  name: { type: String, trim: true, maxlength: 200 },
  phone: { type: String, trim: true, maxlength: 80 },
}, { _id: false });

const contactBlock = new mongoose.Schema({
  title: { type: String, trim: true, maxlength: 120 },
  lines: [{ type: String, trim: true, maxlength: 250 }],
}, { _id: false });

const voucherHeader = new mongoose.Schema({
  rightLogo: { type: String, trim: true, maxlength: 2048 },
  rightTitle: { type: String, trim: true, maxlength: 200 },
  rightSubtitle: { type: String, trim: true, maxlength: 200 },
  rightContact: { type: String, trim: true, maxlength: 250 },
}, { _id: false });

const voucherSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  referredByAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  voucherNo: { type: String, required: true, unique: true, index: true },
  bookingNo: { type: String, trim: true },
  manualServiceNo: { type: String, trim: true },
  branch: { type: String, trim: true },
  groupNo: { type: String, trim: true },
  groupName: { type: String, trim: true },
  adultCount: { type: Number, min: 0, default: 0 },
  childCount: { type: Number, min: 0, default: 0 },
  infantCount: { type: Number, min: 0, default: 0 },
  separateBeds: { type: Number, min: 0, default: 0 },
  totalPax: { type: Number, min: 0, default: 0 },
  totalNights: { type: Number, min: 0, default: 0 },
  travelBy: { type: String, trim: true },
  specialInstructions: { type: String, trim: true, maxlength: 2000 },
  managementContacts: {
    makkah: { type: managementContact, default: () => ({}) },
    madinah: { type: managementContact, default: () => ({}) },
    transport: { type: managementContact, default: () => ({}) },
  },
  contactBlocks: { type: [contactBlock], default: [] },
  voucherHeader: { type: voucherHeader, default: () => ({}) },
  watermarkUrl: { type: String, trim: true, maxlength: 2048 },
  voucherDate: { type: Date, required: true, index: true }, package: { type: String, trim: true },
  status: { type: String, enum: ['DRAFT', 'APPROVED', 'CANCELLED', 'EXPIRED'], default: 'DRAFT', index: true }, customer: { name: { type: String, required: true, trim: true }, familyHead: { type: String, trim: true }, email: { type: String, trim: true, lowercase: true, maxlength: 254 }, phone: { type: String, trim: true, maxlength: 60 }, photo: { type: String, trim: true, maxlength: 2048 } },
  mutamers: { type: [person], default: [] },
  accommodation: { type: [accommodation], default: [] },
  flights: { type: [flight], default: [] },
  transport: { type: [transport], default: [] },
  termsAndConditions: [String], cancelledAt: Date, cancellationReason: { type: String, trim: true, maxlength: 500 }, cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, qrToken: { type: String, required: true, unique: true, index: true }, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
export default mongoose.model('Voucher', voucherSchema);
