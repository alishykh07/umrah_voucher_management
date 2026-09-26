import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['super_admin', 'admin', 'staff'], default: 'staff' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  phone: { type: String, trim: true, maxlength: 60 },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  profilePhoto: { type: String, trim: true, maxlength: 2048 },
  lastLogin: { type: Date, default: null },
}, { timestamps: true });
userSchema.pre('save', async function hashPassword(next) { if (!this.isModified('password')) return next(); this.password = await bcrypt.hash(this.password, 12); next(); });
userSchema.methods.comparePassword = function comparePassword(candidatePassword) { return bcrypt.compare(candidatePassword, this.password); };
userSchema.methods.toPublicJSON = function toPublicJSON() { return { id: this._id.toString(), name: this.name, email: this.email, role: this.role, status: this.status, phone: this.phone || '', company: this.company || null, profilePhoto: this.profilePhoto || '', lastLogin: this.lastLogin || null, createdAt: this.createdAt, updatedAt: this.updatedAt }; };
export default mongoose.model('User', userSchema);
