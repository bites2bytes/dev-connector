const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const { check, validationResult } = require('express-validator');
const User = require('../../models/User');

//@route POST api/users
//@desc Register user
//@access Public
router.post('/', [
	check('name', 'Name is required').not().isEmpty(),
	check('email', 'Please include a valid email').isEmail(),
	check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { name, email, password } = req.body

		try {
			//Check if user exists
			let user = await User.findOne({ email });
			if (user) {
				return res.status(400).json({ errors: [{msg: 'User already exists'}]});
			}

			//Get user's gravatar
			const avatar = gravatar.url(email, {
				s: '200',
				r: 'pg',
				d: 'mm'
			})

			user = new User({
				name,
				email,
				avatar,
				password
			})

			//Encript password 
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);

			//Save user to database
			await user.save();

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