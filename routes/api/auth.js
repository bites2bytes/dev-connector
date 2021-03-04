const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const config = require('config');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

//@route GET api/auth
//@desc Test route
//@access Public
//protected route
router.get('/', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');
		res.json(user)	
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});


//@route POST api/auth
//@desc Authenticate user & get token
//@access Public - the purpose of this route is to get the token so that we can make a request to private routes
router.post('/',
 [
	check('email', 'Please include a valid email').isEmail(),
	check('password', 'Password is required').exists()
 ],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { email, password } = req.body

		try {
			//Check if user exists
			let user = await User.findOne({ email });
			if (!user) {
				return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
			}

			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
			}
		

			//Return jsonwebtoken (in order for the user to be logged in right after registration)
			const payload = {
				user: {
					id: user.id
				}
			}

			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{ expiresIn: 3600000 }, //change back to 3600
				(err, token) => {
					if (err) throw err;
					res.json({token}) //we will send the token back to the client in headers in access protective routes
				}
			);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server error');
		}

	});


module.exports = router;