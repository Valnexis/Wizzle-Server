import express from 'express'
import crypto from 'crypto'

const router = express.Router()
const conversations = new Map()

router.post('/', (req, res) => {
    const {memberIds, title} = req.body
    if (!memberIds || memberIds.length < 2) {
        return res.status(400).json({error: 'Need at least 2 members'})
    }
    
    const id = crypto.randomUUID()
    const conv = {
        id,
        title: title || 'Direct Chat',
        isGroup: memberIds.length > 2,
        members: memberIds,
        lastMessage: null,
        updatedAt: new Date().toISOString()
    }
    
    conversations.set(id, conv)
    res.json(conv)
})

router.get('/', (req, res) => {
    res.json([...conversations.values()])
})

export default router
