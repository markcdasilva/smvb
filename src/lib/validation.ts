import { z } from 'zod';

export const CompanySchema = z.object({
  companyName: z.string().min(2).max(100),
  cvr: z.string().regex(/^\d{8}$/, 'CVR skal være 8 cifre'),
  employees: z.number().int().positive(),
  contactPerson: z.string().min(2).max(100),
  email: z.string().email(),
});

export const FileUploadSchema = z.object({
  fileName: z.string(),
  fileSize: z.number().max(10 * 1024 * 1024), // 10MB max
  mimeType: z.enum([
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/csv',
    'text/plain',
    'text/x-csv'
  ]),
});