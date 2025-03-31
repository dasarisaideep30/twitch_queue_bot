import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function VideoQueue() {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    fetchQueue();
    socket.on("queueUpdated", fetchQueue);
    return () => socket.off("queueUpdated", fetchQueue);
  }, []);

  const fetchQueue = async () => {
    const res = await fetch("http://localhost:5000/queue");
    const data = await res.json();
    setQueue(data);
  };

  const removeVideo = async (id) => {
    await fetch(`http://localhost:5000/queue/${id}`, { method: "DELETE" });
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Video Queue</h1>
      <ul>
        {queue.map((video) => (
          <li key={video._id} className="mb-2 p-2 border rounded flex justify-between">
            <a href={video.videoLink} target="_blank" rel="noopener noreferrer" className="text-blue-500">
              {video.videoLink}
            </a>
            <button
              onClick={() => removeVideo(video._id)}
              className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
