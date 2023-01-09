const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
// const authMiddleware = require('./middleware/auth')

const app = express()
const PORT = process.env.PORT

// app.use(authMiddleware)

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.get('/', (req, res) => {
	res.send('<h1>Homepage</h1>')
})

app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`)
	console.log('Press Ctrl+C to quit.')
})