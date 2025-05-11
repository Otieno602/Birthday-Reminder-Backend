const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');

const registration = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
    
        if (existingUser) return res.status(400).json({ message: 'User already exists'});

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error', error);
        res.status(500).json({ message: 'Something went wrong. Try again later!'});
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await User.findOne({ email });

        if (!user) return res.status(401).json({ message: 'Invalid Email or Password' });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) return res.status(401).json({ message: 'Invalid Email or Password' });

        // Genarate token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Login Failed. Try again later.' })
    }
};

const recallPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ message: 'Reset link sent if email exists.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000;
        await user.save();

        console.log(`Reset link: http://localhost:5000/resetPassword/${token}`);

        return res.status(200).json({ message: 'Reset link sent if email exists.' });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Something went wrong. Try again later.' });
    }
}

const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: {$gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or Expired token'});
        }

        res.status(200).json({ message: 'Valid Token'});
    } catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({message: 'Something went wrong. Try again later.'});
    }
}

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or Expired Token.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        await user.save();
        return res.status(200).json({ message: 'Password reset successfully. You can now login'});
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Something went wrong. Try again later.'});
    }
}

module.exports = { registration, login, recallPassword, verifyResetToken, resetPassword }