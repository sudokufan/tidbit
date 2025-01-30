import {useEffect, useState} from "react";
import {doc, getDoc, Timestamp} from "firebase/firestore";
import {db, auth} from "../lib/firebase";
import {useAuthState} from "react-firebase-hooks/auth";
import {
  loadFeedFromLocalStorage,
  saveFeedToLocalStorage,
} from "@/helpers/localStorageFeed";
import {Tidbit} from "@/types/tidbit";

type TidbitFeedProps = {
  refresh: boolean;
};

export const TidbitFeed = ({refresh}: TidbitFeedProps) => {
  const [tidbits, setTidbits] = useState<Tidbit[]>([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (!user) return;

    const fetchFeed = async () => {
      const userId = user.uid;
      const cachedFeed = await loadFeedFromLocalStorage(userId);

      if (cachedFeed && cachedFeed.lastUpdated) {
        const tidbitTime = cachedFeed.lastUpdated;
        const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

        if (tidbitTime >= twentyFourHoursAgo) {
          console.log("🕰 Using localStorage daily feed.");
          setTidbits(cachedFeed.tidbits || []);
          return;
        }
      }

      const dailyFeedRef = doc(db, "dailyFeed", userId);
      const dailyFeedSnap = await getDoc(dailyFeedRef);
      console.log("🕰 Using Firestore daily feed.");
      setTidbits(dailyFeedSnap.data()?.tidbits || []);
      await saveFeedToLocalStorage(userId, {
        tidbits: dailyFeedSnap.data()?.tidbits,
        lastUpdated: Timestamp.now().toMillis(),
      });

      return;
    };

    fetchFeed();
  }, [user, refresh]);

  if (!user) return <p>Please log in to see Tidbits.</p>;

  return (
    <div className="p-4">
      {tidbits.length === 0 ? (
        <p>No Tidbits from your connections yet.</p>
      ) : (
        tidbits.map((tidbit) => (
          <div
            key={tidbit.id}
            className="p-4 border-b bg-white shadow-md rounded-lg"
          >
            <p className="text-lg">
              {tidbit.emoji} <strong>{tidbit.username}</strong>
            </p>
            <p className="text-gray-700">{tidbit.message}</p>
          </div>
        ))
      )}
    </div>
  );
};
