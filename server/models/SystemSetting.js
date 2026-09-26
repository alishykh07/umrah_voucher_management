import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'dashboard' },
  dashboardName: { type: String, trim: true, maxlength: 100, default: 'Umrah Voucher' },
  dashboardSubtitle: { type: String, trim: true, maxlength: 100, default: 'Management System' },
  logoUrl: { type: String, trim: true, maxlength: 2048, default: '' },
  sidebarColor: { type: String, trim: true, default: '#061c40' },
  sidebarTextColor: { type: String, trim: true, default: '#d4e4fc' },
  appTextColor: { type: String, trim: true, default: '#112e59' },
}, { timestamps: true });

export default mongoose.model('SystemSetting', systemSettingSchema);