module.exports = function appAuth(req, res, next) {
    const token = req.header('app-token');
    if(!token) return res.status(403).send( {sucess: false, message: 'Auth app access Denied' })

    try {
        const verified = token == process.env.IOS_TOKEN
        req.app = verified
        next();
    } catch(err) {
        res.status(403).send({ sucess: false, message: 'Invalid app token'});
    }
}