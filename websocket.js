import {WebSocketServer} from "ws";

export const clients = new Map();

export function attachWebSocket(server) {
    const wss = new WebSocketServer({server});
    wss.on("connection", (ws) => {
        let userId = null;

        ws.on("message", (raw) => {
            try {
                const msg = JSON.parse(raw.toString());

                if (msg.type === "identify") {
                    userId = msg.userId;
                    clients.set(userId, ws);
                    console.log(`${userId} connected`);
                    return;
                }

                if (msg.type === "message") {
                    for (const [uid, client] of clients) {
                        if (uid !== msg.message.senderId && client.readyState === 1) {
                            client.send(JSON.stringify({
                                type: "message",
                                message: msg.message
                            }));
                        }
                    }
                }

                if (msg.type === "delivered") {
                    const receiver = msg.to;
                    const target = clients.get(receiver);
                    if (target?.readyState === 1) {
                        target.send(JSON.stringify({
                            type: "delivered",
                            messageId: msg.messageId
                        }));
                    }
                }

                if (msg.type === "read") {
                    const receiver = msg.to;
                    const target = clients.get(receiver);
                    if (target?.readyState === 1) {
                        target.send(JSON.stringify({
                            type: "read",
                            messageId: msg.messageId
                        }));
                    }
                }
            } catch (err) {
                console.error("WebSocket parse error", err);
            }
        });

        ws.on("close", () => {
            if (userId) clients.delete(userId);
        });
    });

    console.log("WebSocket server attached");
}