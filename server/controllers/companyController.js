import Company from '../models/Company.js';
import Voucher from '../models/Voucher.js';
import { slugify } from '../utils/slugify.js';

const getPayload = (body) => {
  const name = body.name?.trim();
  if (!name) { const error = new Error('Company name is required.'); error.statusCode = 400; throw error; }
  const slug = slugify(body.slug || name);
  if (!slug) { const error = new Error('A valid company slug is required.'); error.statusCode = 400; throw error; }
  return { name, slug, logo: body.logo?.trim() || '', phone: body.phone?.trim() || '', whatsapp: body.whatsapp?.trim() || '', email: body.email?.trim() || '', address: body.address?.trim() || '', website: body.website?.trim() || '', status: body.status === 'inactive' ? 'inactive' : 'active' };
};
export const listCompanies = async (req, res, next) => { try { const query = req.query.search ? { $text: { $search: req.query.search } } : {}; const companies = await Company.find(query).sort({ createdAt: -1 }); res.json({ companies }); } catch (error) { next(error); } };
export const getCompany = async (req, res, next) => { try { const company = await Company.findById(req.params.id); if (!company) return res.status(404).json({ message: 'Company not found.' }); res.json({ company }); } catch (error) { next(error); } };
export const createCompany = async (req, res, next) => { try { const company = await Company.create(getPayload(req.body)); res.status(201).json({ company }); } catch (error) { if (error.code === 11000) { error.statusCode = 409; error.message = 'This company slug already exists.'; } next(error); } };
export const updateCompany = async (req, res, next) => { try { const company = await Company.findByIdAndUpdate(req.params.id, getPayload(req.body), { new: true, runValidators: true }); if (!company) return res.status(404).json({ message: 'Company not found.' }); res.json({ company }); } catch (error) { if (error.code === 11000) { error.statusCode = 409; error.message = 'This company slug already exists.'; } next(error); } };
export const deleteCompany = async (req, res, next) => { try { const inUse = await Voucher.exists({ company: req.params.id }); if (inUse) return res.status(409).json({ message: 'This company has voucher records and cannot be deleted.' }); const company = await Company.findByIdAndDelete(req.params.id); if (!company) return res.status(404).json({ message: 'Company not found.' }); res.status(204).send(); } catch (error) { next(error); } };
