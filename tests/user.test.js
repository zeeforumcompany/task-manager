const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/User')

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

beforeEach((done) => {
	User.deleteMany().then(async () => {
		await new User(userOne).save()
		done()
	})
})

test('Should signup a new user', async () => {
	const response = await request(app).post('/users').send({
		name: "Zee Forum",
		email: "zeeforumcompany@gmail.com",
		password: "testpp123"
	}).expect(201)

	// Assert that the database changed correctly
	const user = await User.findById(response.body.user._id)
	expect(user).not.toBeNull()

	// Assertion about the response
	// expect(response.body.user.name).toBe('Zee Forum')
	expect(response.body).toMatchObject({
		user: {
			name: "Zee Forum",
			email: "zeeforumcompany@gmail.com"
		},
		access_token: user.tokens[0].token
	})

	expect(user.passsword).not.toBe('testpp123')
})

test('Should login existing user', async () => {
	const response = await request(app).post('/users/login').send({
		email: userOne.email,
		password: userOne.password
	}).expect(200)

	const user = await User.findById(userOneId)
	expect(response.body.access_token).toBe(user.tokens[user.tokens.length - 1].token)
})

test('Should not login nonexistent user', async () => {
	await request(app).post('/users/login').send({
		email: userOne.email,
		password: "testpp123"
	}).expect(400)
})

test('Should get profile for user', async () => {
	await request(app)
		.get('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)
})

test('Should get get profile for unauthenticated user', async () => {
	await request(app)
		.get('/users/me')
		.send()
		.expect(401)
})

test('Should delete account for user', async () => {
	await request(app)
		.delete('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)

	const user = await User.findById(userOneId)
	expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
	await request(app)
		.delete('/users/me')
		.send()
		.expect(401)
})

test('Should upload avatar image', async () => {
	await request(app)
		.post('/users/me/avatar')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.attach('avatar', 'tests/fixtures/profile-pic.jpg')
		.expect(200)

	const user = await User.findById(userOneId)
	expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
	let name = "Test Name"
	await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			name
		}).expect(200)

	const user = await User.findById(userOneId)
	expect(user.name).toEqual(name)
})

test('Should not update invalid user fields', async () => {
	let location = "Sargodha"
	await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			location
		}).expect(400)
})