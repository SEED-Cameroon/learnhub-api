/**
 * Role-based authorization middleware factory.
 * Must run after `auth` — relies on req.user.role from the verified JWT.
 *
 * @param {...string} allowedRoles
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    return next();
  };
}

export default requireRole;
