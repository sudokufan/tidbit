import {useEffect, useState} from "react";
import {
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import {db, auth} from "../lib/firebase";
import EmojiPicker from "emoji-picker-react";
import {updateTidbitFeed} from "@/helpers/updateTidbitFeed";
import Tidbit from "./tidbit";
import {Textarea} from "@heroui/react";

type TidbitFormProps = {
  onPostConfirm?: () => void;
  disabled: boolean;
};

export const TidbitForm = ({onPostConfirm, disabled}: TidbitFormProps) => {
  const [message, setMessage] = useState("");
  const [emoji, setEmoji] = useState("🎉");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);
  const [canPost, setCanPost] = useState(false);
  const [latestTidbit, setLatestTidbit] = useState<{
    emoji: string;
    message: string;
    username: string;
    timestamp: {seconds: number; nanoseconds: number};
  } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  //   • Subscribes to a Firestore “tidbits” document for the current user.
  // • Whenever this doc changes, we read its data (like emoji, message, and timestamp).
  // • If there’s a valid timestamp within the past 24 hours, we calculate how much time is left until the user can post again, disable posting if necessary, and store that time.
  // • If the 24 hours are already up (or there’s no timestamp), we enable posting.
  // • On cleanup, it stops listening to Firestore.
  useEffect(() => {
    if (!auth.currentUser) return;

    const tidbitRef = doc(db, "tidbits", auth.currentUser.uid);

    const unsubscribe = onSnapshot(tidbitRef, (snapshot) => {
      if (snapshot.exists()) {
        const tidbitData = snapshot.data();
        setLatestTidbit({
          emoji: tidbitData.emoji,
          message: tidbitData.message,
          username: tidbitData.username,
          timestamp: tidbitData.timestamp,
        });

        const lastTimestamp = tidbitData.timestamp?.toMillis();
        if (lastTimestamp) {
          setLastTimestamp(lastTimestamp);
          const now = new Date();
          const diffMs = 24 * 60 * 60 * 1000 - (now.getTime() - lastTimestamp);
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
  }, [auth.currentUser]);

  // • Looks at a “lastTimestamp” (when the user last posted).
  // • Calculates the remaining 24-hour window.
  // • If that time is up, posting is allowed. Otherwise, we keep track of how many milliseconds remain.
  // • It updates every second via setInterval to give a live countdown.
  useEffect(() => {
    if (!lastTimestamp) return;

    const updateCountdown = () => {
      const now = Date.now();
      const remainingTime = lastTimestamp + 24 * 60 * 60 * 1000 - now;

      if (remainingTime <= 0) {
        setTimeLeft(0);
        setCanPost(true);
      } else {
        setTimeLeft(remainingTime);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [lastTimestamp]);

  //   • Gathers the current user’s ID and looks up the user’s name in Firestore (defaulting to “Unknown”).
  // • Creates or updates a “tidbits” doc with the user’s ID, name, chosen emoji, message, and a new timestamp.
  // • Resets the local state to indicate we’ve just posted: clears out the message, sets the cooldown timer back to 24 hours, disables future posts, and resets any pending states.
  const confirmPostTidbit = async () => {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const tidbitRef = doc(db, "tidbits", userId);
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const username = userSnap.data()?.name;

    await setDoc(tidbitRef, {
      userId,
      username,
      emoji,
      message,
      timestamp: serverTimestamp(),
    });

    await updateTidbitFeed();
    onPostConfirm?.();

    setLatestTidbit({
      emoji,
      message,
      username,
      timestamp: {
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: (Date.now() % 1000) * 1000000,
      },
    });
    setMessage("");
    setTimeLeft(24 * 60 * 60 * 1000);
    setCanPost(false);
  };

  const formatTimeLeft = () => {
    if (timeLeft === null || timeLeft <= 0) return "Next post available now!";
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    return `Next post in ${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <>
      {latestTidbit && timeLeft !== null && timeLeft > 0 ? (
        <div className="max-w-[1062px] mb-8 px-4 w-full">
          <Tidbit tidbit={latestTidbit} formatTimeLeft={formatTimeLeft} />
        </div>
      ) : (
        <>
          <div className="flex items-center max-w-[1030px] mb-8 w-full space-x-3 bg-white p-4 rounded-lg shadow-md relative">
            <button
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="w-12 h-12 text-3xl border rounded bg-gray-100 flex items-center justify-center"
            >
              {emoji}
            </button>

            {showEmojiPicker && (
              <div className="absolute top-20 -left-3 z-50">
                <EmojiPicker
                  onEmojiClick={(event) => {
                    setEmoji(event.emoji);
                    setShowEmojiPicker(false);
                  }}
                />
              </div>
            )}

            <Textarea
              placeholder={
                disabled ? "Set your display name!" : "Share your tidbit"
              }
              isDisabled={disabled}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
              minRows={1}
            />
            <button
              onClick={confirmPostTidbit}
              disabled={!canPost}
              className="bg-gold px-4 py-2 rounded disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </>
      )}
    </>
  );
};
