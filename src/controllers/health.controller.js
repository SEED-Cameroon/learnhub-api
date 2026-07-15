/**
 * GET /api/health
 * Simple liveness check endpoint. Does not depend on the database being
 * reachable, so it keeps responding even if MongoDB is down.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function getHealth(req, res) {
  res.status(200).json({
    success: true,
    data: { status: 'ok' },
    message: 'Service is healthy',
  });
}

export default getHealth;
