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

export const sendVerificationEmail = async (
  providerEmail: string,
  foodDetails: {
    foodId: string,
    charityId: string,
    foodName: string;
    quantity: string;
    description: string;
  },
  charityName: string
) => {
  const token = jwt.sign({ foodId: foodDetails.foodId, charityId: foodDetails.charityId }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  const dashboardLink = `${process.env.NEXTAUTH_URL}/dashboard/provider`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: providerEmail,
    subject: 'New Food Request',
    html: `<p>${charityName} wants to request your ${foodDetails.foodName}. 
       <a href="${process.env.NEXTAUTH_URL}/dashboard/provider">Click here to review</a>
       <br/><br/>
       Food Details: ${foodDetails.description}
       <br/>
       Quantity: ${foodDetails.quantity}kg</p>`
  };

  await transporter.sendMail(mailOptions);
};

export const sendConfirmationEmail = async (
  charityEmail: string,
  foodDetails: {
    foodName: string;
    pickupLocation: string;
  }
) => {
  const mailOptions = {
    from: `"FoodBridge" <${process.env.EMAIL_USER}>`,
    to: charityEmail,
    subject: 'Request Confirmed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d3748;">Request Confirmed! ✅</h2>
        <p style="font-size: 16px;">
          Your request for <strong>${foodDetails.foodName}</strong> has been confirmed!
        </p>
        <p style="font-size: 16px;">
          Pickup Location: ${foodDetails.pickupLocation}
        </p>
        <p style="font-size: 14px; color: #718096; margin-top: 20px;">
          You can now coordinate the pickup with the provider.
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const sendRejectionEmail = async (
  charityEmail: string,
  foodDetails: {
    foodName: string;
    reason: string;
  }
) => {
  const mailOptions = {
    from: `"FoodBridge" <${process.env.EMAIL_USER}>`,
    to: charityEmail,
    subject: 'Request Rejected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d3748;">Request Rejected ❌</h2>
        <p style="font-size: 16px;">
          Your request for <strong>${foodDetails.foodName}</strong> has been rejected.
        </p>
        <p style="font-size: 16px;">
          Reason: ${foodDetails.reason}
        </p>
        <p style="font-size: 14px; color: #718096; margin-top: 20px;">
          You can browse other available food items in your area.
        </p>
      </div>
    `
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