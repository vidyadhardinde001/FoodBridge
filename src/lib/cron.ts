import { connectDB, Notification, Food } from '@/lib/db';
import { scheduleJob as schedule } from 'node-schedule';

let isInitialized = false;

export function setupConfirmationChecks() {

  if (isInitialized) return;
  isInitialized = true;
  // Run every hour
  schedule('*0 * * * *', async () => {
    console.log('Cron job running at:', new Date().toISOString());
    await connectDB();
    const expiringNotifications = await Notification.find({
      type: 'confirmation',
      status: 'pending',
      expiresAt: { $lte: new Date() }
    }).populate('food');

    for (const notification of expiringNotifications) {
      // Update food status
      await Food.findByIdAndUpdate(notification.food._id, {
        status: 'available'
      });

      // Create reminder
      await Notification.create({
        charity: notification.charity,
        type: 'reminder',
        message: `Confirmation period expired for ${notification.food.foodName}. Did you receive the order?`,
        status: 'pending'
      });

      // Mark notification as expired
      notification.status = 'expired';
      await notification.save();
    }
  });
}