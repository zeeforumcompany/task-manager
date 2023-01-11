const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const authMiddleware = require('../middleware/auth')
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')

const router = new express.Router()

router.post('/users', async (req, res) => {
	const user = new User(req.body)

	try {
		await user.save()
		sendWelcomeEmail(user.email, user.name)
		const token = await user.generateAuthToken()

		res.status(201).json({ user, access_token: token })
	} catch (err) {
		res.status(400).json({ 'error': err })
	}
})

router.post('/users/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password)

		const token = await user.generateAuthToken()

		res.json({
			user,
			access_token: token
		})
	} catch (err) {
		res.status(400).json({ 'error': err.message })
	}
})

router.get('/users/me', authMiddleware, async (req, res) => {
	res.json(req.user)
})


// File Uploading
const upload = multer({
	// dest: 'avatars/',
	limits: {
		fileSize: 1000000
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return cb(new Error('Please upload an image.'))
		}

		cb(undefined, true)
	}
})

router.post('/users/me/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
	const buffer = await sharp(req.file.buffer).png().resize({
		width: 250,
		height: 250
	}).toBuffer()
	req.user.avatar = buffer
	await req.user.save()
	res.send()
}, (error, req, res, next) => {
	res.status(400).json({
		error: error.message
	})
})

router.delete('/users/me/avatar', authMiddleware, async (req, res) => {
	try {
		req.user.avatar = undefined
		await req.user.save()
		res.send()
	} catch (err) {
		res.status(500).send();
	}
})

router.get('/users/:id/avatar', async (req, res) => {
	try {
		const user = await User.findById(req.params.id)

		if (!user || !user.avatar) return res.status(404).json({ error: 'No avatar found' })

		res.set('Content-Type', 'image/png')
		res.send(user.avatar)
	} catch (err) {
		res.status(500).send();
	}
})

router.post('/users/logout', authMiddleware, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
		await req.user.save()

		res.send()
	} catch (err) {
		res.status(500).send()
	}
})

router.post('/users/logoutAll', authMiddleware, async (req, res) => {
	try {
		req.user.tokens = []

		await req.user.save()

		res.send()
	} catch (err) {
		res.status(500).send()
	}
})

router.get('/users/:id', async (req, res) => {
	try {
		let user = await User.findById(req.params.id)

		if (!user) {
			res.status(404).json({ 'error': 'User not found' })
		}

		return res.json(user)
	} catch (err) {
		res.status(500).send()
	}
})

router.patch('/users/me', authMiddleware, async (req, res) => {
	const updates = Object.keys(req.body)
	const allowedUpdates = [
		"email",
		"password",
		"name",
		"age"
	];

	const isValidOperation = updates.every((field) => allowedUpdates.includes(field))
	if (!isValidOperation) return res.status(400).json({
		error: "Invalid Updates!"
	})

	try {
		updates.forEach(update => req.user[update] = req.body[update])
		await req.user.save()

		return res.json(req.user)
	} catch (e) {
		res.status(500).send()
	}
})

router.patch('/users/:id', authMiddleware, async (req, res) => {
	const updates = Object.keys(req.body)
	const allowedUpdates = [
		"email",
		"password",
		"name",
		"age"
	];

	const isValidOperation = updates.every((field) => allowedUpdates.includes(field))
	if (!isValidOperation) return res.status(400).json({
		error: "Invalid Updates!"
	})

	try {
		let user = await User.findById(req.params.id)

		if (!user) return res.status(404).json({ 'error': 'No user found.' })

		updates.forEach(update => user[update] = req.body[update])
		await user.save()

		return res.json(user)
	} catch (e) {
		res.status(500).send()
	}
})

router.delete('/users/me', authMiddleware, async (req, res) => {
	try {
		await req.user.remove();
		sendCancellationEmail(req.user.email, req.user.name)
		res.json(req.user)
	} catch (e) {
		res.status(500).json({
			error: e.message
		})
	}
})

router.delete('/users/:id', authMiddleware, async (req, res) => {
	try {
		let user = await User.findById(req.params.id)

		if (!user) return res.status(404).json({ 'error': 'User not found' })

		await user.remove();

		res.json(user)
	} catch (e) {
		res.status(500).send()
	}
})

module.exports = router