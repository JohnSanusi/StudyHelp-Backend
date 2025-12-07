// Middleware to check if user has a specific role
export const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
};

// Helper for teacher only routes
export const isTeacher = checkRole(['teacher']);

// Helper for student only routes
export const isStudent = checkRole(['student']);
