const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/User')
const { setupDatabase, userOne, userOneId } = require('./fixtures/db')

beforeEach(setupDatabase)

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

test('Should not signup user with invalid name/email/password', async () => {
	await request(app)
		.post('/users')
		.send({
			name: userOne.name,
			email: userOne.email,
			password: userOne.password
		})
		.expect(400)
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

test('Should not update user if unauthenticated', async () => {
	let name = 'Jess'
	await request(app)
		.patch('/users/me')
		.send({
			name
		})
		.expect(401)
})

test('Should not update user with invalid name/email/password', async () => {
	let name = ''
	await request(app)
		.patch('/users/me')
		.send({
			name
		})
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.expect(500)
})

test('Should not delete user if unauthenticated', async () => {
	await request(app)
		.delete('/users/me')
		.expect(401)
})