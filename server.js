import http from 'http';
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import authRouter from './routes/auth.js'
import chatRouter from './routes/chats.js'
import msgRouter from './routes/messages.js'
import { attachWebSocket } from './websocket.js'

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.use('/auth', authRouter)
app.use('/chats', chatRouter)
app.use('/messages', msgRouter)
app.get("/", (req, res) => res.send("Wizzle Backend running"));

const server = http.createServer(app)
attachWebSocket(server);

app.listen(3001, () => console.log(`Server is listening on http://localhost:3001`))
