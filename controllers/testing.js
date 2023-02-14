const testingRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

testingRouter.post('/reset', async (request, response) => {
    await Note.deleteMany({ })
    await User.deleteMany({ })

    response.status(200).end()
})

module.exports = testingRouter
