const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
	//Get token from header (when we send a request to a protected route, we need to send a token within a header)
	const token = req.header('x-auth-token'); //the header key we want to send the token to

	//Check if there is no token
	if (!token) {
		return res.status(401).json({ msg: 'No token, authorization denied' });
	}

	//Verify token
	try {
		const decoded = jwt.verify(token, config.get('jwtSecret')); 
		req.user = decoded.user;
		next();
	} catch (err) {
		res.status(401).json({ msg: "Token is not valid" });
	}

}