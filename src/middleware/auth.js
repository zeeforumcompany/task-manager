const jwt = require('jsonwebtoken')
const User = require('../models/user')

const authMiddleware = async (req, res, next) => {
	let unauthenticatedUrls = [
		'/users/login',
		'/users',
	];

	if (unauthenticatedUrls.includes(req.url)) {
		return next()
	}

	try {
		let token = req.header('Authorization').replace('Bearer ', '')
		let data = jwt.verify(token, process.env.JWT_SECRET)
		const user = await User.findOne({
			_id: data._id,
			'tokens.token': token
		})

		if (!user) throw new Error('No user found!')

		req.token = token
		req.user = user
		next()
	} catch (err) {
		res.status(401).json({ error: 'Please authenticate!' })
	}
}

module.exports = authMiddleware