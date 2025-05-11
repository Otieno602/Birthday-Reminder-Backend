const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: {
        type: String,
        default: null
    },
    resetTokenExpiry: {
        type: Date,
        default: null
    },
    lastMonthlyReminder: {
        type: Date,
        default: null,
    },
    lastThreeDayReminder: {
        type: Date,
        default: null,
    },
    lastSameDayReminder: {
        type: Date,
        default: null,
    }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);