// lib/auth.ts

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET!;

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user: any) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};