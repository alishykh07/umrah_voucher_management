import 'dotenv/config';
import { connectDatabase } from '../config/db.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
const required = ['INITIAL_ADMIN_NAME', 'INITIAL_ADMIN_EMAIL', 'INITIAL_ADMIN_PASSWORD'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
try { await connectDatabase(); const email = process.env.INITIAL_ADMIN_EMAIL.trim().toLowerCase(); const existing = await User.findOne({ email }); if (existing) console.info(`Admin already exists for ${email}.`); else { await User.create({ name: process.env.INITIAL_ADMIN_NAME, email, password: process.env.INITIAL_ADMIN_PASSWORD, role: 'admin', status: 'active' }); console.info(`Admin created for ${email}.`); } } finally { await mongoose.disconnect(); }
