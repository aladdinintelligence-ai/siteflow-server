import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';

const FORBIDDEN_DRIVER_KEYS = [
  'unitPrice',
  'totalPrice',
  'commercialTerms',
  'creditNoteAmount',
  'netInvoiced',
  'salesValue',
  'totalSalesValueThisMonth',
  'price',
  'margin',
  'cost',
];

function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  // Handle plain objects / Mongoose toObject
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const isForbidden = FORBIDDEN_DRIVER_KEYS.some(
      (k) => k.toLowerCase() === key.toLowerCase() || key.toLowerCase().includes('price')
    );

    if (!isForbidden) {
      sanitized[key] = typeof value === 'object' && value !== null ? sanitizeObject(value) : value;
    }
  }

  return sanitized;
}

export function driverPrivacyFirewall(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const originalJson = res.json.bind(res);

  res.json = function (body: any) {
    if (req.user?.role === 'driver') {
      const sanitizedBody = sanitizeObject(body);
      return originalJson(sanitizedBody);
    }
    return originalJson(body);
  };

  next();
}

