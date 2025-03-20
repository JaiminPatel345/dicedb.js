import { useEffect, useState } from "react";
import { Card, CardContent } from "./components/ui/card";
import { io, Socket } from "socket.io-client";

export default function Chat({ name, key }: { name: string, key: string }) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<{ sender: string; data: string, isSelf: boolean }[]>(
        []
    );
    const [socket, setSocket] = useState<Socket>();
    const [onlineCount, setOnlineCount] = useState(0);
    const [joined, setJoined] = useState(false);
    const [id, setId] = useState("");

    useEffect(() => {
        const socket = io("http://localhost:3000", {
            reconnection: false
        });
        setSocket(socket)

        socket.on("id", (id: string) => {
            console.log(id)
            setId(id)
        })

        socket.on("chat", (data: string) => {
            console.log(data);
            const parsed = JSON.parse(data);
            const isSelf = parsed["id"] === id
            console.log(parsed)
            setMessages((prev: any) => [...prev, { ...parsed, isSelf: isSelf }]);
            setOnlineCount(parsed.online || 0);
        });
        return () => {
            socket.disconnect();
        };
    }, []);



    const joinChat = () => {
        socket?.emit("join", JSON.stringify({ key, name }));
        setJoined(true);
    };

    const sendMessage = () => {
        if (message.trim()) {
            socket?.emit("chat", message);
            setMessage("");
        }
    };

    return (
        <>
            <Card className="w-full max-w-md p-4">
                <CardContent>
                    <p className="text-sm mb-2">Online: {onlineCount} | Room : {key}</p>
                    <div className="space-y-2 h-64 overflow-y-auto border p-2 rounded">
                        {messages.map((msg: { sender: any; data: any; isSelf: boolean }, index: any) => (
                            <div key={index} className="p-2 rounded bg-gray-100">
                                {
                                    msg?.isSelf &&
                                    <div>
                                        <p className=" text-right">
                                            {msg.data}
                                            <strong>:{msg.sender} </strong>
                                        </p>
                                    </div>
                                }
                                {
                                    !msg?.isSelf &&
                                    <div>
                                        <p className="">
                                            <strong>{msg.sender}: </strong>
                                            {msg.data}
                                        </p>
                                    </div>
                                }
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Input
                            value={message}
                            onChange={(e: { target: { value: any; }; }) => setMessage(e.target.value)}
                            placeholder="Type a message"
                        />
                        <Button onClick={sendMessage}>Send</Button>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}