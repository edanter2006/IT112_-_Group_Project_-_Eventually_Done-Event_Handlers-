const jwt = require('jsonwebtoken');
const User = require('../models/User');

// PROTECT MIDDLEWARE (Real JWT Verification)
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Support both 'id' and 'userId' token payloads safely
            const targetUserId = decoded.id || decoded.userId;
            req.user = await User.findById(targetUserId).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized: User not found' });
            }

            next();
        } catch (error) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
};

// AUTHORIZE MIDDLEWARE (RBAC)
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
        }
        next();
    };
};