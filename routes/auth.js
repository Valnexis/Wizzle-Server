import express from 'express'
import crypto from 'crypto'
import { db } from "../db.js";

const router = express.Router()

router.post('/signup', (req, res) => {
    const {email, password, givenName, familyName} = req.body
    
    if (!email || !password || !givenName || !familyName) {
        return res.status(400).json({error: 'Missing fields' })
    }

    const exists = db
        .prepare("SELECT * FROM users WHERE email = ?")
        .get(email);
    if (exists) {
        return res.status(400).json({error: 'User already exists'});
    }

    const id = crypto.randomUUID()
    const displayName = `${givenName} ${familyName}`;

    const user = { id, email, displayName };

    res.json({
        accessToken: `access-${id}`,
        refreshToken: `refresh-${id}`,
        user
    });
});

router.post('/signin', (req, res) => {
    const { email, password } = req.body
    
    if (!email || !password) {
        return res.status(400).json({error: 'Missing credentials'})
    }
    
    const record = db
        .prepare("SELECT * FROM users WHERE email = ? AND password = ?")
        .get(email, password);

    if (!record) {
        return res.status(401).json({error: 'Invalid credentials'})
    }

    const user = {
        id: record.id,
        email: record.email,
        displayName: record.displayName,
    };
    
    res.json({
        accessToken: `access-${record.id}`,
        refreshToken: `refresh-${record.id}`,
        user,
    });
});

export default router
