import express from 'express';
import crypto from 'crypto';
import { db } from "../db.js";

const router = express.Router()

router.post("/", (req, res) => {
    const { memberIds, title } = req.body;

    if (!memberIds || memberIds.length < 2) {
        return res.status(400).json({ error: "Need at least 2 members" });
    }

    const id = crypto.randomUUID()
    const conv = {
        id,
        title: title || 'Direct Chat',
        isGroup: memberIds.length > 2 ? 1 : 0,
        members: JSON.stringify(memberIds),
        lastMessage: null,
        updatedAt: new Date().toISOString()
    };

    db.prepare(
        `INSERT INTO conversations (id, title, isGroup, members, lastMessage, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
        conv.id,
        conv.title,
        conv.isGroup,
        conv.members,
        conv.lastMessage,
        conv.updatedAt,
    );

    res.json(conv);
});


router.get('/userId', (req, res) => {
    const { userId } = req.params;

    const all = db.prepare("SELECT * FROM conversations").all();
    const filtered = all.filter((c) =>
        JSON.parse(c.members).includes(userId)
    );

    const parsed = filtered.map((c) => ({
        ...c,
        isGroup: !!c.isGroup,
        members: JSON.parse(c.members),
        lastMessage: c.lastMessage ? JSON.parse(c.lastMessage) : null,
    }));

    res.json(parsed);
});

// (Optional) GET ALL FOR DEBUG
router.get("/", (req, res) => {
    const all = db.prepare("SELECT * FROM conversations").all();
    const parsed = all.map((c) => ({
        ...c,
        isGroup: !!c.isGroup,
        members: JSON.parse(c.members),
        lastMessage: c.lastMessage ? JSON.parse(c.lastMessage) : null,
    }));
    res.json(parsed);
});

export default router
