import {WebSocketServer} from "ws";

export function attachWebSocket(server) {
    const wss = new WebSocketServer({server});
    const clients = new Set();

    wss.on("connection", (ws) => {
        clients.add(ws);
        ws.on("close", () => clients.delete(ws));

        ws.on("message", (raw) => {
            try {
                const msg = JSON.parse(raw.toString());
                for (const c of clients) {
                    if (c !== ws && c.readyState === 1) {
                        c.send(JSON.stringify(msg));
                    }
                }
            } catch (err) {
                console.error("WebSocket parse error", err);
            }
        });
    });

    console.log("WebSocket server attached");
}