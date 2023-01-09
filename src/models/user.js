const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')

const userSchema = new mongoose.Schema({
	name: {
		type: String,
        required: true,
		trim: true
	},
	email: {
		type: String,
		unique: true,
		required: [true, "Enter your email address"],
		trim: true,
		lowercase: true,
		validate: {
			validator: (email) => validator.isEmail(email),
			message: "Please enter a valid email address"
		}
	},
	password: {
		type: String,
        required: [true, "Enter your password"],
		minlength: 7,
		validate: {
			validator: (password) => !validator.contains(password.toLowerCase(), 'password'),
			message: "Password should not contain \"password\"."
		},
		trim: true
	},
	age: {
		type: Number,
        validate: {
			validator: (v) => {
				return v >= 0
			},
			message: (props) => `Age must be a positive number.`
		},
		default: 0
	},
	tokens: [{
		token: {
			type: String,
			required: true
		}
	}],
	avatar: {
		type: Buffer
	}
}, {
	timestamps: true
})

userSchema.virtual('tasks', {
	ref: 'Task',
	localField: '_id',
	foreignField: 'createdBy'
})

userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email: email })

	if (!user) throw new Error('Unable to find user.')

	const isMatch = await bcrypt.compare(password, user.password)
	if (!isMatch) throw new Error('Username/Password mismatch.')

	return user
}

userSchema.methods.generateAuthToken = async function() {
	const user = this

	const token = jwt.sign({
		_id: user._id.toString()
	}, process.env.JWT_SECRET)

	user.tokens = user.tokens.concat({  token })
	await user.save()

	return token
}

userSchema.methods.toJSON = function() {
	const user = this
	let userObject = user.toObject()

	delete userObject.password
	delete userObject.tokens
	delete userObject.avatar

	return userObject
}

// Hash plain password before saving
userSchema.pre('save', async function (next) {
	const user = this

	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8)
	}

	next()
})


// Delete the tasks when user is deleted
userSchema.pre('remove', async function (next) {
	const user = this

	await Task.deleteMany({
		createdBy: user._id
	})

	// next()
})

const User = mongoose.model('User', userSchema)

// export default User
module.exports = User