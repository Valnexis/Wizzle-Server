import express from "express";
import crypto from "crypto";

const router = express.Router();

// In-memory message store
const messages = new Map();

router.post("/:conversationId", (req, res) => {
    const { conversationId } = req.params;
    const { senderId, content } = req.body;

    if (!senderId || !content) {
        return res.status(400).json({ error: "Missing senderId or content" });
    }

    const msg = {
        id: crypto.randomUUID(),
        conversationId,
        senderId,
        sentAt: new Date().toISOString(),
        kind: { type: "text", value: content },  // 👈 match Swift enum
        status: "sent"
    };

    const list = messages.get(conversationId) || [];
    list.push(msg);
    messages.set(conversationId, list);

    console.log("Sending message:", msg)
    res.json(msg);
});

router.get("/:conversationId", (req, res) => {
    const { conversationId } = req.params;
    res.json(messages.get(conversationId) || []);
});

export default router;