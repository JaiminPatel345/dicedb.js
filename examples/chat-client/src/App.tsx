import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";

export default function ChatApp() {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{
    name: string; sender: string; data: string; isSelf: boolean
  }[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [joined, setJoined] = useState(false);
  const [id, setId] = useState("");

  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleSocketId = (newId: string) => {
      console.log("Socket ID : ", newId);
      setId(newId);
    };

    const handleChat = (data: string) => {
      const parsed = JSON.parse(data);
      setMessages((prev) => [...prev, { ...parsed, isSelf: parsed.id === id }]);
      setOnlineCount(parsed.online || 0);
    };

    socket.on("socket-id", handleSocketId);
    socket.on("chat", handleChat);
    socket.on("disconnect", () => {
      setSocket(null);
      setJoined(false);
      setMessages([]);
      setOnlineCount(0);
    });

    return () => {
      socket.off("socket-id", handleSocketId);
      socket.off("chat", handleChat);
    };
  }, [socket, id]);

  const joinChat = () => {
    if (!name.trim() || !key.trim()) return;

    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }

    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);
    newSocket.emit("join", JSON.stringify({ key, name }));
    setJoined(true);
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket?.emit("chat", message);
      setMessage("");
    }
  };

  const disconnectChat = () => {
    socket?.disconnect();
    setSocket(null);
    setJoined(false);
    setMessages([]);
    setOnlineCount(0);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      {!joined ? (
        <div className="w-full max-w-md space-y-2">
          <Input
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Enter room key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
          <Button className="w-full" onClick={joinChat}>
            Join Chat
          </Button>
        </div>
      ) : (
        <Card className="w-full max-w-md p-4">
          <CardContent>
            <p className="text-sm mb-2">User: {name} | Online: {onlineCount} | Room: {key}</p>
            <div className="space-y-2 h-64 overflow-y-auto border p-2 rounded">
              {messages.map((msg, index) => (
                <div key={index} className="p-2 rounded bg-gray-100">
                  {msg.isSelf ? (
                    <p className="text-right">
                      {msg.data} <strong>:you</strong>
                    </p>
                  ) : (
                    <p>
                      <strong>{msg.name}:</strong> {msg.data}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
            <Button className="mt-2 w-full bg-red-500 hover:bg-red-600" onClick={disconnectChat}>
              Disconnect
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
