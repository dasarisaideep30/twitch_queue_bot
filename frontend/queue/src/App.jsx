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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl p-6 bg-gray-950 shadow-xl rounded-2xl">
        <h1 className="text-3xl font-extrabold mb-6 text-center tracking-wide">
          🎥 Twitch Video Queue
        </h1>
        <ul className="space-y-4">
          {queue.length === 0 ? (
            <p className="text-gray-400 text-center">No videos in the queue yet.</p>
          ) : (
            queue.map((video) => (
              <li
                key={video._id}
                className="bg-gray-800 p-4 rounded-lg flex justify-between items-center hover:bg-gray-700 transition shadow-md"
              >
                <a
                  href={video.videoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline break-all max-w-[80%]"
                >
                  {video.videoLink}
                </a>
                <button
                  onClick={() => removeVideo(video._id)}
                  className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md transition"
                >
                  ❌
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}