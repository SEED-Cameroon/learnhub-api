import jwt from 'jsonwebtoken';

/**
 * Like `auth`, but never rejects: attaches req.user when a valid Bearer
 * token is sent, and continues as a guest otherwise. Used on public reads
 * that personalise their response (likedByMe, isFollowing, draft access).
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET, {
        algorithms: ['HS256'],
      });
    } catch {
      // An expired or invalid token on a public route just means "guest".
    }
  }
  next();
}

export default optionalAuth;
