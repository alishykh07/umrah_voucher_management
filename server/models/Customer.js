import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, trim: true, maxlength: 60 },
  familyHead: { type: String, trim: true, maxlength: 100 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  photo: { type: String, trim: true, maxlength: 2048 },
}, { timestamps: true });

export default mongoose.model('Customer', customerSchema);
