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

export const sendVerificationEmail = async (providerEmail: string, foodId: string, charityId: string) => {
  const token = jwt.sign({  foodId,charityId  }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  const verificationLink = `${process.env.NEXTAUTH_URL}/verify/${foodId}?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: providerEmail,
    subject: 'Food Pickup Request',
    html: `<p>A charity has requested your food donation. <a href="${verificationLink}">Click here to verify</a></p>`
  };

  await transporter.sendMail(mailOptions);
};

export const sendConfirmationEmail = async (
  charityEmail: string, 
  foodDetails: { foodName: string,pickupLocation: string }  // Fix parameter type
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: charityEmail,
    subject: 'Pickup Confirmed',
    html: `<p>Your pickup for ${foodDetails.foodName} has been confirmed!</p>`
  };

  await transporter.sendMail(mailOptions);
};

export const sendNotificationEmail = async (
  to: string,
  providerName: string,
  foodDetails: {
    name: string,
    quantity: string,
    condition: string,
    category: string
  },
  dashboardLink: string
) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d3748;">New Food Donation Alert! 🍴</h2>
      <p style="font-size: 16px;">
        ${providerName} has listed ${foodDetails.quantity}kg of 
        <strong>${foodDetails.name}</strong> (${foodDetails.category}) 
        in ${foodDetails.condition} condition.
      </p>
      <p style="font-size: 16px; margin: 20px 0;">
        <a href="${dashboardLink}" 
           style="background-color: #48bb78; color: white; 
                  padding: 12px 24px; text-decoration: none; 
                  border-radius: 5px; display: inline-block;">
          View Details in Dashboard
        </a>
      </p>
      <p style="font-size: 14px; color: #718096;">
        You received this email because a provider in your area listed new food. 
        Manage notifications in your account settings.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"FoodBridge" <${process.env.EMAIL_USER}>`,
    to,
    subject: `New Donation: ${foodDetails.name} Available`,
    html: htmlContent,
  });
};