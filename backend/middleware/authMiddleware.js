
import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
  const secret = process.env.JWT_SECRET;

  // Ensure the JWT secret is configured
  if (!secret) {
    console.error('JWT_SECRET is not configured');
    return res.status(500).json({
      message: 'Internal server configuration error'
    });
  }

  // Read the Authorization header
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  // Check Bearer token format
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      message: 'Authentication required'
    });
  }

  try {
    // Verify token signature and expiration
    const decoded = jwt.verify(token, secret);

    if (!decoded.userId) {
      return res.status(401).json({
        message: 'Invalid authentication token'
      });
    }

    req.user = {
      id: decoded.userId
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }
}
