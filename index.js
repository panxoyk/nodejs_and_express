const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const Note = require('./models/note')

const requestLogger = (request, response, next) => {
    console.log(request.method, request.path, request.body)
    console.log('---')
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(cors())
app.use(express.json())
app.use(requestLogger)
app.use(express.static('build'))

let notes =[]

app.get('/', (request, response) => {
    response.send('<h1> Go to /api/notes </h1>')
})

app.get('/api/notes', (request, response) => {
    Note.find({ }).then(notes => {
        response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response) => {
    Note.findById(request.params.id)
        .then(note => {
            response.json(note)
        })
        .catch(error => {
            response.status(404).end()
        })
})

app.post('/api/notes', (request, response) => {
    const body = request.body

    if (body.content === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }

    const note = new Note({
        content: body.content,
        date: new Date(),  
        important: body.important || false,
    })

    note.save().then(savedNote => {
        response.json(savedNote)
    })
})

app.put('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)

    const changedNote = { 
        id: id, 
        content: request.body.content, 
        date: request.body.date, 
        important: !request.body.important 
    }

    notes = notes.map(note => note.id !== id ? note : changedNote)

    response.json(notes)
})

app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id)

    response.status(204).end()
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})