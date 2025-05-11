require('dotenv').config();

const verifyApiKey = (req, res, next) => {
    const clientKey = req.header('x-api-key');

    if (!clientKey || clientKey !== process.env.API_KEY) {
        return res.status(401).json({ message: 'Unauthorised: Invalid API Key' });
    }

    next();
};

module.exports = verifyApiKey;