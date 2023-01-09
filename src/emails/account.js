const sgMail = require('@sendgrid/mail')

const sendGridApiKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendGridApiKey) //process.env.SENDGRID_API_KEY

const sendWelcomeEmail = (email, name) => {
	const msg = {
		to: email, // Change to your recipient
		from: 'test@zeeforum.com', // Change to your verified sender
		subject: 'Welcome to the Task App',
		text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
		// html: '<strong>and easy to do anywhere, even with Node.js</strong>',
	}

	sgMail.send(msg)
	.then(() => {
		console.log('Email sent')
	})
	.catch((error) => {
		console.error(error)
	})
}

const sendCancellationEmail = (email, name) => {
	const msg = {
		to: email,
		from: "test@zeeforum.com",
		subject: "Sorry to see you go!",
		text: `Sorry to see you go, ${name}. Let us know why you have left us.\n\nThanks`
	}

	sgMail.send(msg)
	.then(() => {
		console.log('Email sent!')
	})
	.catch((error) => {
		console.error(error)
	})
}

module.exports = {
	sendWelcomeEmail,
	sendCancellationEmail
}