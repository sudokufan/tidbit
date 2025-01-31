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
  onLatestTidbitUpdated?: (timestamp: number) => void;
  disabled: boolean;
};

export const TidbitForm = ({
  onPostConfirm,
  onLatestTidbitUpdated,
  disabled,
}: TidbitFormProps) => {
  const [message, setMessage] = useState("");
  const [emoji, setEmoji] = useState("🎉");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [canPost, setCanPost] = useState(false);
  const [undoVisible, setUndoVisible] = useState(false);
  const [_, setUndoTimer] = useState(0);
  const [undoIntervalId, setUndoIntervalId] = useState<ReturnType<
    typeof setInterval
  > | null>(null);
  const [latestTidbit, setLatestTidbit] = useState<{
    emoji: string;
    message: string;
    username: string;
    timestamp: {seconds: number; nanoseconds: number};
  } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
        if (tidbitData.timestamp) {
          onLatestTidbitUpdated?.(tidbitData.timestamp.toMillis()); // Send timestamp up
        }
        const lastTimestamp = tidbitData.timestamp?.toMillis();
        if (lastTimestamp) {
          const lastDate = new Date(lastTimestamp);
          const now = new Date();
          const isToday =
            lastDate.getUTCDate() === now.getUTCDate() &&
            lastDate.getUTCMonth() === now.getUTCMonth() &&
            lastDate.getUTCFullYear() === now.getUTCFullYear();
          if (isToday) {
            setCanPost(false);
            return;
          }
        }
      }
      setCanPost(true);
    });
    return () => unsubscribe();
  }, [auth.currentUser]);

  useEffect(() => {
    if (!latestTidbit) return;
    const tick = () => {
      const lastMS =
        latestTidbit.timestamp?.seconds * 1000 +
        latestTidbit.timestamp?.nanoseconds / 1000000;
      if (!lastMS) {
        setTimeLeft(null);
        setCanPost(true);
        return;
      }
      const postedDate = new Date(lastMS);
      const now = new Date();
      const isToday =
        postedDate.getUTCDate() === now.getUTCDate() &&
        postedDate.getUTCMonth() === now.getUTCMonth() &&
        postedDate.getUTCFullYear() === now.getUTCFullYear();
      if (!isToday) {
        setTimeLeft(null);
        setCanPost(true);
        return;
      }
      const nextMidnight = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
      );
      const msLeft = nextMidnight.getTime() - now.getTime();
      if (msLeft <= 0) {
        setTimeLeft(null);
        setCanPost(true);
        return;
      }
      setTimeLeft(msLeft);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [latestTidbit]);

  const removePost = async () => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    await setDoc(doc(db, "tidbits", userId), {});

    // ✅ Mark that the user used Undo today
    await setDoc(
      doc(db, "users", userId),
      {
        lastUndo: serverTimestamp(),
      },
      {merge: true},
    );
  };

  const confirmPostTidbit = async () => {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const tidbitRef = doc(db, "tidbits", userId);
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const username = userSnap.data()?.name;

    // Check if Undo has been used today
    const userData = userSnap.data();
    const lastUndoTimestamp = userData?.lastUndo?.toMillis() ?? 0;
    const lastUndoDate = new Date(lastUndoTimestamp);
    const today = new Date();
    const hasUndoneToday =
      lastUndoDate.getUTCDate() === today.getUTCDate() &&
      lastUndoDate.getUTCMonth() === today.getUTCMonth() &&
      lastUndoDate.getUTCFullYear() === today.getUTCFullYear();

    // Save tidbit
    await setDoc(tidbitRef, {
      userId,
      username,
      emoji,
      message,
      timestamp: serverTimestamp(),
    });

    // ✅ Only update feed if user hasn't undone today
    if (!hasUndoneToday) {
      await updateTidbitFeed();
    }

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
    onLatestTidbitUpdated?.(Date.now());
    setCanPost(false);
  };

  const handlePostClick = async () => {
    if (!auth.currentUser) return;
    confirmPostTidbit();
    setUndoVisible(true);
    setUndoTimer(10);
    const interval = setInterval(() => {
      setUndoTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setUndoVisible(false);
          setUndoTimer(0);
          setMessage("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setUndoIntervalId(interval);
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
      {latestTidbit && canPost === false && undoVisible === false ? (
        <div className="mb-8 w-full">
          <Tidbit tidbit={latestTidbit} formatTimeLeft={formatTimeLeft} />
        </div>
      ) : (
        <>
          <div className="flex items-center max-w-5xl mb-8 w-full space-x-3 bg-white p-4 rounded-lg shadow-md relative">
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
                disabled
                  ? "Set your display name!"
                  : undoVisible
                    ? message
                    : "Share your tidbit"
              }
              isDisabled={disabled || undoVisible}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
              minRows={1}
            />
            <button
              onClick={handlePostClick}
              disabled={!canPost || message === ""}
              className="bg-gold px-4 py-2 rounded disabled:opacity-50"
            >
              {undoVisible ? "Posted!" : "Post"}
            </button>
            {undoVisible && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (undoIntervalId) clearInterval(undoIntervalId);
                    setUndoVisible(false);
                    setUndoTimer(0);
                    removePost();
                    setMessage("");
                  }}
                  className="bg-burgundy text-gray-200 px-4 py-2 rounded"
                >
                  Undo
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};
