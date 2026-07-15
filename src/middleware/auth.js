import jwt from 'jsonwebtoken';

/**
 * JWT authentication middleware.
 * Reads the `Authorization: Bearer <token>` header, verifies the token
 * using JWT_SECRET (explicitly restricted to the HS256 algorithm to reject
 * an `alg: none` token), and attaches the decoded payload to req.user.
 *
 * Responds with a generic 401 on any missing/invalid token — never leaks
 * verification details to the client.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
}

export default auth;
