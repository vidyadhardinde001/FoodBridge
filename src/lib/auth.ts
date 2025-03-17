import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "./db.ts";

const JWT_SECRET = process.env.JWT_SECRET!;

// Hash password
export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

// Compare password
export const comparePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
export const generateToken = (user: any) => {
  return jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Verify token
export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};

// ✅ Add registerUser function
export const registerUser = async (
  username: string,
  email: string,
  password: string,
  healthIssues: string[] = [],
  allergies: string[] = []
) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(password);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    healthIssues,
    allergies,
  });

  await newUser.save();

  return { id: newUser._id, username: newUser.username, email: newUser.email };
};

// ✅ Add loginUser function
export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user);
  return { token, user: { id: user._id, username: user.username, email: user.email } };
};
