const request = require('supertest')
const { response, set } = require('../src/app')
const app = require('../src/app')
const Task = require('../src/models/task')
const {
	setupDatabase,
	userOne,
	userOneId,
	userTwo,
	taskOne,
	taskThree
} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create task', async () => {
	const response = await request(app)
		.post('/tasks')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			description: 'Test Task',
			createdBy: userOneId
		})
		.expect(201)

	const task = await Task.findById(response.body._id)

	expect(task).not.toBeNull()
	expect(task.completed).toBe(false)
})

test('Should fetch user tasks', async () => {
	const response = await request(app)
		.get('/tasks')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.expect(200)

	expect(response.body.length).toEqual(2)
})

test('Should fetch only completed tasks', async () => {
	const response = await request(app)
	.get('/tasks?completed=true')
	.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
	.expect(200)

	expect(response.body.length).toEqual(1)
})

test('Should fetch only incomplete tasks', async () => {
	const response = await request(app)
	.get('/tasks?completed=false')
	.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
	.expect(200)

	expect(response.body.length).toEqual(1)
})

test('Should fetch user tasks by id', async () => {
	await request(app)
		.get(`/tasks/${taskOne._id}`)
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.expect(200)
})

test('Should not fetch user task by id if unauthenticated', async () => {
	await request(app)
	.get(`/tasks/${taskOne._id}`)
	.expect(401)
})

test('Should not fetch other users task by id', async () => {
	await request(app)
	.get(`/tasks/${taskOne._id}`)
	.set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
	.expect(404)
})

test('Should not delete the other user tasks', async () => {
	await request(app)
		.delete(`/tasks/${taskOne._id}`)
		.set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
		.expect(404)

	const task = await Task.findById(taskOne._id)
	expect(task).not.toBeNull()
})

test('Should not create task with invalid description/completed', async () => {
	await request(app)
		.post('/tasks')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			// description: '',
			completed: 'help',
			createdBy: userOneId
		})
		.expect(400)
})

test('Should not update task with invalid description/completed', async () => {
	await request(app)
		.patch(`/tasks/${taskOne._id}`)
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			// description: '',
			completed: 'help',
			createdBy: userOneId
		})
		.expect(400)
})

test('Should delete user task', async () => {
	await request(app)
		.delete(`/tasks/${taskOne._id}`)
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.expect(200)

	const task = await Task.findById(taskOne._id)
	expect(task).toBeNull()
})

test('Should not delete task if unauthenticated', async () => {
	await request(app)
		.delete(`/tasks/${taskOne._id}`)
		.expect(401)
})

test('Should not update other user tasks', async () => {
	await request(app)
	.patch(`/tasks/${taskThree._id}`)
	.send({
		description: 'Sample description'
	})
	.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
	.expect(404)

	const task = await Task.findById(taskThree._id)
	expect(task.description).not.toEqual('Sample description')
})