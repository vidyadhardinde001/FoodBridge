// lib/email.ts

import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// console.log("Email User:", process.env.EMAIL_USER);
// console.log("Email Password:", process.env.EMAIL_PASSWORD);
// console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);


export const sendVerificationEmail = async (providerEmail: string, foodId: string, providerId: string) => {
  const token = jwt.sign({ providerId, foodId }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  const verificationLink = `${process.env.NEXTAUTH_URL}/verify/${foodId}?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: providerEmail,
    subject: 'Food Pickup Request',
    html: `<p>A charity has requested your food donation. <a href="${verificationLink}">Click here to verify</a></p>`
  };

  await transporter.sendMail(mailOptions);
};

// lib/email.ts
export const sendConfirmationEmail = async (
  charityEmail: string, 
  foodDetails: { foodName: string }  // Fix parameter type
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: charityEmail,
    subject: 'Pickup Confirmed',
    html: `<p>Your pickup for ${foodDetails.foodName} has been confirmed!</p>`
  };

  await transporter.sendMail(mailOptions);
};