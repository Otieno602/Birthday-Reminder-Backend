const cron = require('node-cron');
const sendEmail = require('../utils/sendEmail');
const Birthday = require('../models/Birthday');
const User = require('../models/user');

cron.schedule(process.env.CRON_MONTHLY,  async () => {
    console.log('📬 Running monthly birthday reminder...');

    const now = new Date();
    const currentMonth = now.getMonth() + 1;

    try {
        const users = await User.find({});

        for (const user of users) {
            try {
                const lastSent = user.lastMonthlyReminder;
                const alreadySentThisMonth = 
                    lastSent && 
                    lastSent.getMonth() === now.getMonth() && 
                    lastSent.getFullYear() === now.getFullYear();

                if (alreadySentThisMonth) {
                    console.log(`⏩ Already sent monthly reminder to ${user.email}`);
                    continue;
                }

                const birthdays = await Birthday.find({
                    user: user._id,
                    $expr: {
                        $eq: [{ $month: '$date'}, currentMonth],
                    },
                });

                if (birthdays.length > 0) {
                    const birthdayList = birthdays.map((b) =>
                        `🎉 ${b.name} - ${b.date.toDateString()}`).join('\n');

                    await sendEmail(
                        user.email,
                        `🎉 Birthdays This Month`,
                        `Here are the birthdays for this month:\n\n${birthdayList}`
                    );


                    user.lastMonthlyReminder = new Date();
                    await user.save();
                    console.log(`✅ Monthly email sent to ${user.email}`);
                } else {
                    console.log(`No birthdays this month for ${user.email}`);
                }
            } catch (err) {
                console.error(`❌ Error processing monthly reminder for ${user.email}:`, err);
            }
        }
    } catch (err) {
        console.error('❌ Error fetching users:', err);
    }
}, {
   timezone: 'Africa/Nairobi' 
});

