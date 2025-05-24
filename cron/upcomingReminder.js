const cron3Day = require('node-cron');
const sendEmail = require('../utils/sendEmail');
const Birthday = require('../models/Birthday');
const User = require('../models/user');

cron3Day.schedule(process.env.CRON_3DAY, async () => {
    console.log("🎯 CRON TRIGGERED: 3DAY at", new Date().toISOString());

    console.log('📬 Running 3-day birthday reminder');

    const now = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(now.getDate() + 3);

    try {
        const users = await User.find({});

        for (const user of users) {
            try {
                const lastSent = user.lastThreeDayReminder;
                const alreadySent = 
                    lastSent &&
                    lastSent.getDate() === now.getDate() &&
                    lastSent.getMonth() === now.getMonth() &&
                    lastSent.getFullYear() === now.getFullYear();

                if (alreadySent) {
                    console.log(`⏩ Already sent 3-day reminder ${user.email}`);
                    continue;
                }

                const birthdays = await Birthday.find({
                    user: user._id,
                    $expr: {
                        $and: [
                            { $eq: [{ $dayOfMonth: '$date'}, threeDaysLater.getDate()] },
                            { $eq: [{ $month: '$date'}, threeDaysLater.getMonth() + 1] }
                        ]
                    }
                });

                if (birthdays.length > 0) {
                    const birthdayList = birthdays.map((b) => `🎉 ${b.name} - ${b.date.toDateString()}`).join('\n');

                    await sendEmail(
                        user.email,
                            `🎉 Upcoming birthday in 3 days`,
                            `These birthdays are in 3 days:\n\n${birthdayList}`
                    );

                    user.lastThreeDayReminder = new Date();
                    await user.save();
                    console.log(`✅ 3-day reminder sent to ${user.email}`);
                } else {
                    console.log(`📭 No birthdays in 3-days for ${user.email}`)
                }
            } catch (err) {
                console.log(`❌ Error processing upcoming reminder for ${user.email}:`, err)
            }
        }
    } catch (err) {
        console.log('❌ Error sending 3-day reminder:', err);
    }    
});