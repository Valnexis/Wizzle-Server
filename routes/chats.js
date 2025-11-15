import express from 'express';
import crypto from 'crypto';
import { db } from "../db.js";

const router = express.Router()

router.post("/", (req, res) => {
    try {
        const { memberIds, title } = req.body;
        if (!memberIds || memberIds.length < 2) {
            return res.status(400).json({ error: "Need at least 2 members" });
        }

        // Verify users exist
        const placeholders = memberIds.map(() => "?").join(",");
        const existingUsers = db
            .prepare(`SELECT id FROM users WHERE id IN (${placeholders})`)
            .all(...memberIds);
        if (existingUsers.length !== memberIds.length) {
            console.log("❌ Some IDs not found:", memberIds, "found:", existingUsers);
            return res.status(400).json({ error: "One or more user IDs not found" });
        }

        const id = crypto.randomUUID();
        const conv = {
            id,
            title: title || "Direct Chat",
            isGroup: memberIds.length > 2 ? 1 : 0,
            members: JSON.stringify(memberIds),
            lastMessage: null,
            updatedAt: new Date().toISOString(),
        };

        db.prepare(`
            INSERT INTO conversations (id, title, isGroup, members, lastMessage, updatedAt)
            VALUES (@id, @title, @isGroup, @members, @lastMessage, @updatedAt)
        `).run(conv);

        const response = {
            ...conv,
            isGroup: Boolean(conv.isGroup),
            members: memberIds,
            lastMessage: null,
        };

        console.log("✅ Created conversation:", response);
        return res.json(response);
    } catch (err) {
        console.error("❌ Chat creation failed:", err);
        return res.status(500).json({ error: "Server error", details: err.message });
    }
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

router.delete("/conversationId", (req, res) => {
    const {conversationId} = req.params;

    try {
        // Removes all messages in this conversation
        db.prepare(`DELETE FROM messages WHERE conversationId = ?`).run(conversationId);

        // Remove conversation record
        const info = db.prepare("DELETE FROM conversations WHERE id = ?").run(conversationId);

        if (info.changes === 0) {
            return res.status(404).json({ error: "Conversation Not Found" });
        }

        console.log("🗑️ Deleted conversation:", conversationId);
        res.json({ success: true, id: conversationId });
        res.json({ success: true, id: conversationId });
    } catch (err) {
        console.error("❌ Delete conversation failed:", err);
        return res.status(500).json({ error: "Server error", details: err.message });
    }
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
