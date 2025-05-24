const cron = require('node-cron');
const sendEmail = require('../utils/sendEmail');
const Birthday = require('../models/Birthday');
const User = require('../models/user');

cron.schedule(process.env.CRON_SAMEDAY, async () => {
    console.log("🎯 CRON TRIGGERED: SAMEDAY at", new Date().toISOString());

    console.log('📬 Running same-day birthday reminder');

    const now = new Date();

    try {
        const users = await User.find({});

        for (const user of users) {
            try {
                const lastSent = user.lastSameDayReminder;
                const alreadySent = 
                    lastSent &&
                    lastSent.getDate() === now.getDate() &&
                    lastSent.getMonth() === now.getMonth() &&
                    lastSent.getFullYear() === now.getFullYear();

                if (alreadySent) {
                    console.log(`⏩ Already sent same-day reminder to ${user.email}`);
                    continue;
                }

                const birthdays = await Birthday.find({
                    user: user._id,
                    $expr: {
                        $and: [
                            { $eq: [{ $dayOfMonth: '$date'}, now.getDate()] },
                            { $eq: [{ $month: '$date'}, now.getMonth() + 1] }
                        ]
                    }
                });

                if (birthdays.length > 0) {
                    const birthdayList = birthdays.map((b) =>
                        `🎂 ${b.name} - ${b.date.toDateString()}`
                    ).join('\n');

                    await sendEmail(
                        user.email,
                        `🎂 Birthdays Today!`,
                        `Here are today's birthdays:\n\n${birthdayList}`
                    );

                    user.lastSameDayReminder = new Date();
                    await user.save();
                    console.log(`✅ Today reminder sent to ${user.email}`);
                } else {
                    console.log(`📭 No birthdays today for ${user.email}`);
                }
            } catch (err) {
                console.log(`❌ Error processing same-day reminder for ${user.email}:`, err);
            }
        }
    } catch (err) {
        console.log('❌ Error sending same-day reminders:', err);
    }
});
