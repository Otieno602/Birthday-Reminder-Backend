const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if authorization headers exist ans start with Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Extract token
    const token = authHeader.split(' ')[1]; 
    try {
        // verify token using your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'User no longer exists' });
        }
        
        // Attach the decoded user data to the request
        req.user = user;
        // Allow the request to move forward
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid Token' });
    }
};

module.exports = protect;