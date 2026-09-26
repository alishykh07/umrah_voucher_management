import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  logo: { type: String, trim: true, maxlength: 2048 },
  phone: { type: String, trim: true, maxlength: 50 },
  whatsapp: { type: String, trim: true, maxlength: 50 },
  email: { type: String, trim: true, lowercase: true, maxlength: 254 },
  address: { type: String, trim: true, maxlength: 500 },
  website: { type: String, trim: true, maxlength: 2048 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });
companySchema.index({ name: 'text', slug: 'text' });
export default mongoose.model('Company', companySchema);
