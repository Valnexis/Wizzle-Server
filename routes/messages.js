import express from "express";
import crypto from "crypto";
import { db } from "../db.js";
import { clients } from "../websocket.js";

const router = express.Router();

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
        kind: JSON.stringify({type: "text", value: content }),
        status: "sent",
    };

    db.prepare(
        `INSERT INTO messages (id, conversationId, senderId, sentAt, kind, status)
             VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
        msg.id,
        msg.conversationId,
        msg.senderId,
        msg.sentAt,
        msg.kind,
        msg.status
    );

    const updatedAt = msg.sentAt;
    db.prepare(
        `UPDATE conversations SET lastMessage = ?, updatedAt = ? WHERE id = ?`
    ).run(JSON.stringify(msg), updatedAt, conversationId);

    const convo = db.prepare("SELECT * FROM conversations WHERE id = ?").get(conversationId);
    if (convo) {
        const members = JSON.parse(convo.members);
        convo.lastMessage = JSON.parse(convo.lastMessage);
        convo.isGroup = !!convo.isGroup;

        members.forEach((memberId) => {
            const ws = clients.get(memberId);
            if (ws?.readyState === 1) {
                ws.send(
                    JSON.stringify({
                        type: "chat_update",
                        conversation: convo,
                    })
                );
            }
        });
    }

    console.log("✅ Message sent:", msg)
    res.json({
        ...msg,
        kind: JSON.parse(msg.kind),
    });
});

router.get("/:conversationId", (req, res) => {
    const { conversationId } = req.params;
    const rows = db
        .prepare("SELECT * FROM messages WHERE conversationId = ? ORDER BY sentAt ASC")
        .all(conversationId);

    const messages = rows.map((r) => ({
        ...r,
        kind: JSON.parse(r.kind),
    }));

    res.json(messages);
});

export default router;