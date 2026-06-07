const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        message: `Accès refusé. Rôles autorisés : ${roles.join(', ')}`,
      });
    }
    next();
  };
};

module.exports = roleMiddleware;
