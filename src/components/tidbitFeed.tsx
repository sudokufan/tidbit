import {useEffect, useState} from "react";
import {doc, getDoc, setDoc, Timestamp} from "firebase/firestore";
import {db, auth} from "../lib/firebase";
import {useAuthState} from "react-firebase-hooks/auth";
import {
  loadFeedFromLocalStorage,
  saveFeedToLocalStorage,
} from "@/helpers/localStorageFeed";
import {Tidbit} from "@/types/tidbit";
import {getTidbitFeed} from "@/helpers/getTidbitFeed";

export const TidbitFeed = () => {
  const [tidbits, setTidbits] = useState<Tidbit[]>([]);
  const [nextUpdate, setNextUpdate] = useState<string | null>(null);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (!user) return;

    const fetchFeed = async () => {
      const userId = user.uid;
      const dailyFeedRef = doc(db, "dailyFeed", userId);
      const updateTimeRef = doc(db, "updateTimes", userId);

      const cachedFeed = await loadFeedFromLocalStorage(userId);

      const updateTimeSnap = await getDoc(updateTimeRef);
      let updateTimeStr = updateTimeSnap.exists()
        ? updateTimeSnap.data().updateTime
        : "12:00";

      setNextUpdate(updateTimeStr);

      const [hours, minutes] = updateTimeStr.split(":").map(Number);
      const updateTimeToday = new Date();
      updateTimeToday.setHours(hours, minutes, 0, 0);

      const dailyFeedSnap = await getDoc(dailyFeedRef);
      const lastUpdate = dailyFeedSnap.exists()
        ? dailyFeedSnap.data()?.lastUpdated?.toMillis() || 0
        : 0;
      const nextAllowedUpdate = updateTimeToday.getTime();

      // If the feed was updated after the next allowed update time, use the cached feed
      if (cachedFeed?.lastUpdated >= nextAllowedUpdate) {
        console.log("🕰 Using cached daily feed.");
        setTidbits(cachedFeed.tidbits || []);
        return;
      }

      if (lastUpdate >= nextAllowedUpdate) {
        console.log("🕰 Using Firestore cached feed.");
        setTidbits(dailyFeedSnap.data()?.tidbits || []);
        return;
      }

      console.log("🔄 Fetching new daily feed...");

      const tidbitsDailyFeed = await getTidbitFeed();

      if (
        JSON.stringify(tidbitsDailyFeed) !==
        JSON.stringify(dailyFeedSnap.data()?.tidbits)
      ) {
        await setDoc(dailyFeedRef, {
          tidbits: tidbitsDailyFeed,
          lastUpdated: Timestamp.now(),
        });
      }

      await saveFeedToLocalStorage(userId, {
        tidbits: tidbitsDailyFeed,
        lastUpdated: Timestamp.now().toMillis(),
      });

      if (tidbitsDailyFeed) {
        setTidbits(tidbitsDailyFeed);
      }
    };

    fetchFeed();
  }, [user]);

  if (!user) return <p>Please log in to see Tidbits.</p>;

  return (
    <div className="p-4">
      <p className="text-gray-500 text-sm text-center">
        Next feed update at {nextUpdate}
      </p>
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
