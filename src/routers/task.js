const express = require('express')
const Task = require('../models/task')
const authMiddleware = require('../middleware/auth')

const router = new express.Router()

router.post('/tasks', authMiddleware, async (req, res) => {
	const task = new Task({
		...req.body,
		createdBy: req.user._id
	})

	try {
		await task.save()
		res.status(201).json(task)
	} catch (err) {
		res.status(400).send(err)
	}
})

router.get('/tasks', authMiddleware, async (req, res) => {
	const match = {}

	if (req.query.completed) {
		match.completed = req.query.completed === 'true' ? true : false
	}

	if (req.query.q) {
		let pattern = new RegExp(req.query.q)
		match.description = {
			$regex: pattern,
			$options: 'i'
		}
	}
	
	let resultsPerPage = 2
	const options = {}
	if (req.query.page) {
		options.limit = req.query.limit ? parseInt(req.query.limit) : resultsPerPage
		options.skip = ((parseInt(req.query.page) - 1) * options.limit)
	}

	if (req.query.sortBy) {
		let sort_by = req.query.sortBy
		sort_by = sort_by.split(':')
		options.sort = {}
		options.sort[sort_by[0]] = sort_by[1].toLowerCase() === 'asc' ? 1 : -1
	}
	
	try {
		await req.user.populate({
			path: 'tasks',
			match,
			options
		})

		res.json(req.user.tasks)
	} catch (err) {
		res.status(500).send(err.message)
	}
})

router.get('/tasks/:id', authMiddleware, async (req, res) => {
	try {
		let task = await Task.findOne({
			_id: req.params.id,
			createdBy: req.user._id
		})

		if (!task)
		    res.status(404).json({ 'error': 'Task not found' })

		res.json(task)
	} catch (err) {
		res.status(500).send()
	}
})

router.patch('/tasks/:id', authMiddleware, async (req, res) => {
	const updates = Object.keys(req.body)
	const allowedUpdates = ['description', 'completed']

	const isValidOperation = updates.every(field => allowedUpdates.includes(field))
	if (!isValidOperation) return res.status(400).json({ error: "Invalid Updates!"})

	try {
		let task = await Task.findOne({
			_id: req.params.id,
			createdBy: req.user._id
		})

		if (!task) return res.status(404).json({ 'error': 'No task found!' })

		updates.forEach(update => task[update] = req.body[update])
		await task.save()

		res.json(task)
	} catch (err) {
		res.status(500).send()
	}
})

router.delete('/tasks/:id', authMiddleware, async (req, res) => {
	try {
		let task = await Task.findOneAndDelete({
			_id: req.params.id,
			createdBy: req.user._id
		})

		if (!task) return res.status(404).json({ 'error': 'Task not found!' })

		res.json(task)
	} catch (e) {
		res.status(500).send()
	}
})

module.exports = router