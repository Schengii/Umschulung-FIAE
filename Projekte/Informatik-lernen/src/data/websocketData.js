export const WEBSOCKET_PATTERNS = [
  {
    id: 'ws_handshake',
    title: '1. HTTP Handshake & Upgrade (101 Switching Protocols)',
    desc: 'WebSockets starten als normale HTTP-Anfrage und wechseln dann über den "Upgrade: websocket" Header zu einer vollduplexfähigen TCP-Verbindung.',
    codeSnippet: `GET /chat HTTP/1.1
Host: server.devgame.it
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=`
  },
  {
    id: 'socket_io',
    title: '2. Socket.io Realtime Event Dispatcher',
    desc: 'Sende und empfange Events in Echtzeit für Multi-User Chats oder kollaboratives Editieren.',
    codeSnippet: `// Server Side (Node.js Socket.io)
io.on('connection', (socket) => {
  socket.on('send_message', (data) => {
    io.emit('receive_message', data); // Broadcast an alle Clients
  });
});`
  }
];
