const jwt = require('jsonwebtoken')
const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

notesRouter.get('/', async (request, response) => {
    const notes = await Note
        .find({ }).populate('user', { username: 1, name: 1 })
    response.json(notes)
})

notesRouter.get('/:id', async (request, response) => {
    const note = await Note.findById(request.params.id)

    if (note) {
        response.json(note)
    } else {
        response.status(404).end
    }
})

const getTokenForm = request => {
    const authorization = request.get('authorization')

    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }

    return null
}

notesRouter.post('/', async (request, response) => {
    const body = request.body
    const token = getTokenForm(request)

    const decodenToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodenToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodenToken.id)

    const note = new Note({
        content: body.content,
        date: new Date(),
        important: body.important || false,
        user: user._id
    })

    const savedNote = await note.save()

    user.notes = user.notes.concat(savedNote._id)
    await user.save()

    response.json(savedNote)
})

notesRouter.delete('/:id', async (request, response) => {
    await Note.findByIdAndRemove(request.params.id)
    response.status(204).end()
})

notesRouter.put('/:id', async (request, response) => {
    const body = request.body

    const note = {
        content: body.content,
        important: body.important || false,
    }

    const updatedNote = await Note.findByIdAndUpdate(
        request.params.id, note, { new: true, runValidators: true, context: 'query' }
    )

    response.json(updatedNote)
})

module.exports = notesRouter