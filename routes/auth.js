import express from 'express'
import crypto from 'crypto'

const router = express.Router()

const users = new Map()

router.post('/signup', (req, res) => {
    const {email, password, givenName, familyName} = req.body
    
    if (!email || !password || !givenName || !familyName) {
        return res.status(400).json({error: 'Missing fields' })
    }
        
    if (users.has(email)) {
        return res.status(400).json({error: 'User already exists'})
    }
    
    const id = crypto.randomUUID()
    const user = {id, email, displayName: `${givenName} ${familyName}`}
    
    users.set(email, { ...user, password })
    
    return res.json({
        accessToken: `access-${id}`,
        refreshToken: `refresh-${id}`,
        user
    })
})

router.post('/signin', (req, res) => {
    const { email, password } = req.body
    
    if (!email || !password) {
        return res.status(400).json({error: 'Missing credentials'})
    }
    
    const record = users.get(email)
    if (!record || record.password !== password) {
        return res.status(401).json({error: 'Invalid credentials'})
    }
    
    return res.json({
        accessToken: `access-${record.id}`,
        refreshToken: `refresh-${record.id}`,
        user: {
            id: record.id,
            email: record.email,
            displayName: record.displayName
        }
    })
})

export default router
