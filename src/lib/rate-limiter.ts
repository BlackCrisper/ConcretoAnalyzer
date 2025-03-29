import rateLimit from 'express-rate-limit';
import { NextResponse } from 'next/server';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  handler: (_, __, ___, options) => {
    return NextResponse.json({ success: false, message: options.message }, { status: 429 });
  },
  legacyHeaders: false,
  standardHeaders: true,
});
