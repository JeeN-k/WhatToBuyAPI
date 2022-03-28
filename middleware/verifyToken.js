const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
    const token = req.header('auth-token');
    if(!token) return res.status(403).send({ success: false, message: 'Auth user access Denied'});

    try {
        const verified = jwt.verify(token, process.env.AUTH_TOKEN);
        req.user = verified;
        next();
    }catch(err){
        res.status(403).send({ success: false, message: 'Invalid auth token'});
    }
}