const mongoose = require('mongoose')
const validator = require('validator')

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGODB_URL, {
	autoIndex: true
})