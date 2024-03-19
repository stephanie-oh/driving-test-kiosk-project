function ensureAuthenticated(req, res, next) {
    if (!req.session.userId) {
      // User is not logged in
      return res.status(401).send('You must be logged in to access this page.');
    }
    next();
  }
  
  function ensureIsDriver(req, res, next) {
    if (req.session.userType !== 'Driver') {
      // User is not a driver
      return res.status(403).send('Access is restricted to drivers only.');
    }
    next();
  }
  
  module.exports = { ensureAuthenticated, ensureIsDriver };
  
  