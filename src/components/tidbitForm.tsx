import {useEffect, useState} from "react";
import {doc, setDoc, onSnapshot, serverTimestamp} from "firebase/firestore";
import {db, auth} from "../lib/firebase";

export const TidbitForm = () => {
  const [message, setMessage] = useState("");
  const [emoji, setEmoji] = useState("💬");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);
  const [canPost, setCanPost] = useState(false);
  const [latestTidbit, setLatestTidbit] = useState<{
    emoji: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const tidbitRef = doc(db, "tidbits", auth.currentUser.uid);

    const unsubscribe = onSnapshot(tidbitRef, (snapshot) => {
      if (snapshot.exists()) {
        const tidbitData = snapshot.data();
        setLatestTidbit({
          emoji: tidbitData.emoji,
          message: tidbitData.message,
        });

        const lastTimestamp = tidbitData.timestamp?.toMillis();
        if (lastTimestamp) {
          setLastTimestamp(lastTimestamp);
          const now = new Date();
          const diffMs =
            24 * 60 * 60 * 1000 - (now.getTime() - lastTimestamp.getTime());
          if (diffMs > 0) {
            setTimeLeft(diffMs);
            setCanPost(false);
            return;
          }
        }
      }
      setCanPost(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (timeLeft === null) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (!prev) return null;

        const now = new Date().getTime();
        const remainingTime = (lastTimestamp ?? 0) + 24 * 60 * 60 * 1000 - now;

        if (remainingTime <= 0) {
          clearInterval(interval);
          setCanPost(true);
          return 0;
        }

        return remainingTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const postTidbit = async () => {
    if (!auth.currentUser || !canPost) return;

    const tidbitRef = doc(db, "tidbits", auth.currentUser.uid);
    await setDoc(tidbitRef, {
      userId: auth.currentUser.uid,
      username: auth.currentUser.displayName,
      emoji,
      message,
      timestamp: serverTimestamp(),
    });

    setLatestTidbit({emoji, message});
    setMessage("");
    setTimeLeft(24 * 60 * 60 * 1000);
    setCanPost(false);
  };

  const formatTimeLeft = () => {
    if (!timeLeft || timeLeft <= 0) return "";
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    return `Next post in ${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      {latestTidbit ? (
        <div className="p-4 border rounded-lg bg-white shadow-md text-center">
          <p className="text-2xl">
            {latestTidbit.emoji} {latestTidbit.message}
          </p>
          <p className="text-sm text-gray-500 mt-2">{formatTimeLeft()}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-md">
            <input
              type="text"
              placeholder="Emoji (e.g., 😊)"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-12 text-xl text-center border p-2 rounded"
            />
            <input
              type="text"
              placeholder="What's your tidbit?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 border p-2 rounded"
            />
            <button
              onClick={postTidbit}
              disabled={!canPost}
              className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </>
      )}
    </div>
  );
};
