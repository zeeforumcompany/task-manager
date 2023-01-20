const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const User = require('../../src/models/User')
const Task = require('../../src/models/Task')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
	_id: userOneId,
	name: "John Smith",
	email: "john@example.com",
	password: "testpp$#1",
	tokens: [{
		token: jwt.sign({
			_id: userOneId
		}, process.env.JWT_SECRET)
	}]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
	_id: userTwoId,
	name: "Mark Hand",
	email: "mark@example.com",
	password: "thisistest$#1",
	tokens: [{
		token: jwt.sign({
			_id: userTwoId
		}, process.env.JWT_SECRET)
	}]
}

const taskOne = {
	_id: new mongoose.Types.ObjectId(),
	description: "This is first task",
	completed: false,
	createdBy: userOne._id
}

const taskTwo = {
	_id: new mongoose.Types.ObjectId(),
	description: "This is second task",
	completed: true,
	createdBy: userOne._id
}

const taskThree = {
	_id: new mongoose.Types.ObjectId(),
	description: "This is third task",
	completed: false,
	createdBy: userTwo._id
}

const setupDatabase = async () => {
	await User.deleteMany()
	await Task.deleteMany()
	await new User(userOne).save()
	await new User(userTwo).save()

	await new Task(taskOne).save()
	await new Task(taskTwo).save()
	await new Task(taskThree).save()
}

module.exports = {
	userOneId,
	userOne,
	userTwoId,
	userTwo,
	taskOne,
	taskTwo,
	taskThree,
	setupDatabase
}