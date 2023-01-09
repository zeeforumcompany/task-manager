const {MongoClient, ObjectId} = require('mongodb')

const connectionURL = "mongodb://127.0.0.1:27017"
const databaseName = "task-manager"

// const id = new ObjectId()
// console.log(id.id.length)
// console.log(id.toHexString().length)
// console.log(id.getTimestamp())

MongoClient.connect(connectionURL, { useNewUrlParser: true }, (error, client) => {
	if (error) return console.log('Unable to connect to Database.')

	const db = client.db(databaseName)

	// db.collection('users').findOne({
	// 	_id: new ObjectId("63ae1a9a17d6da0a89eaa1ea")
	// 	// name: "Zartash",
	// 	// age: 27
	// }, (error, user) => {
	// 	if (error) return console.log(error)

	// 	console.log(user)
	// })

	// db.collection("users").find({ name: "Zartash" }).toArray((error, users) => {
	// 	if (error) return console.log(error)

	// 	console.log(users)
	// })
	
	// db.collection("users").find({ name: "Zartash" }).count((error, count) => {
	// 	if (error) return console.log(error)

	// 	console.log(count)
	// })

	// db.collection('users').insertOne({
	// 	_id: id,
	// 	name: "Zee",
	// 	age: 27
	// }, (error, result) => {
	// 	if (error) return console.log('Unable to insert user.')

	// 	console.log(result);
	// })

	// db.collection('users').insertMany([
	// 	{
	// 		name: "Asad",
	// 		age: 25
	// 	},
	// 	{
	// 		name: "Farrukh",
	// 		age: 29
	// 	}
	// ], (error, result) => {
	// 	if (error) return console.log('Unable to insert users.')

	// 	console.log(result)
	// })

	// db.collection('tasks').insertMany([
	// 	{
	// 		description: "This is a test description.",
	// 		completed: true,
	// 	},
	// 	{
	// 		description: "2 This is a test description.",
    //         completed: false,
	// 	}
	// ], (erorr, result) => {
	// 	if (erorr) return console.log('Unable to insert test data.')

	// 	console.log(result)
	// })

	// db.collection('tasks').findOne({
	// 	_id: ObjectId("63af031ac645883c385217d4")
	// }, (err, task) => {
	// 	if (err) return console.log('Unable to find task.')

	// 	console.log(task)
	// })

	// db.collection('tasks').find({
	// 	completed: false
	// }).toArray((err, tasks) => {
	// 	if (err) return console.log('Unable to find tasks.')

	// 	console.log(tasks)
	// });


	// const updatePromise = db.collection('users').updateOne({ _id: ObjectId("63ae1d01fc9efdff958069c4")}, {
	// 	$set: {
	// 		name: "Zeeshan"
	// 	},
	// 	$inc: {
	// 		age: 1
	// 	}
	// })

	// updatePromise.then((result) => {
	// 	console.log(result)
	// }).catch(error => {
	// 	console.log('Unable to update user.')
	// })

	// const updateManyPromise = db.collection('tasks').updateMany({
	// 	completed: false
	// }, {
	// 	$set: {
	// 		completed: true
	// 	}
	// })

	// updateManyPromise.then((result) => {
	// 	console.log(result)
	// }).catch((err) => {
	// 	console.log('Unable to update tasks.')
	// })

	// const deleteOnePromise = db.collection('users').deleteMany({
	// 	// _id: ObjectId("63aefe8983adb872c767a58b")
	// 	age: 29
	// })

	// deleteOnePromise.then((result) => {
	// 	console.log(result)
	// }).catch((err) => {
	// 	console.log('Unable to delete user.')
	// })

	db.collection('tasks').deleteOne({
		description: "This is a test description."
	}).then((result) => {
		console.log(result)
	}).catch((err) => {
		console.log('Unable to delete task.')
	})
})