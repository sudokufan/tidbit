import {useEffect, useState} from "react";
import {doc, getDoc, setDoc, Timestamp} from "firebase/firestore";
import {db, auth} from "../lib/firebase";
import {useAuthState} from "react-firebase-hooks/auth";
import {Preferences} from "@capacitor/preferences";

export const TidbitFeed = () => {
  interface Tidbit {
    id: string;
    emoji: string;
    username: string;
    message: string;
    timestamp: any;
  }

  const [tidbits, setTidbits] = useState<Tidbit[]>([]);
  const [nextUpdate, setNextUpdate] = useState<string | null>(null);
  const [user] = useAuthState(auth);

  const saveFeedToCache = async (userId: string, data: any) => {
    await Preferences.set({
      key: `dailyFeed_${userId}`,
      value: JSON.stringify(data),
    });
  };

  const loadFeedFromCache = async (userId: string) => {
    const result = await Preferences.get({key: `dailyFeed_${userId}`});
    return result.value ? JSON.parse(result.value) : null;
  };

  useEffect(() => {
    if (!user) return;

    const fetchFeed = async () => {
      const userId = user.uid;
      const dailyFeedRef = doc(db, "dailyFeed", userId);
      const updateTimeRef = doc(db, "updateTimes", userId);
      const connectionsRef = doc(db, "connections", userId);

      const cachedFeed = await loadFeedFromCache(userId);

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

      const connectionsSnap = await getDoc(connectionsRef);
      if (!connectionsSnap.exists()) {
        console.warn("No connections found.");
        await setDoc(dailyFeedRef, {tidbits: [], lastUpdated: Timestamp.now()});
        setTidbits([]);
        return;
      }

      const connections = connectionsSnap.data()?.connections || [];
      if (connections.length === 0) {
        console.warn("User has no connections.");
        await setDoc(dailyFeedRef, {tidbits: [], lastUpdated: Timestamp.now()});
        setTidbits([]);
        return;
      }

      const tidbitsData: Tidbit[] = [];
      await Promise.all(
        connections.map(async (connectionId: string) => {
          const tidbitRef = doc(db, "tidbits", connectionId);
          const tidbitSnap = await getDoc(tidbitRef);

          if (tidbitSnap.exists()) {
            const tidbitTime = tidbitSnap.data().timestamp?.toMillis() ?? 0;
            const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
            if (tidbitTime >= twentyFourHoursAgo) {
              tidbitsData.push({
                id: connectionId,
                emoji: tidbitSnap.data().emoji,
                username: tidbitSnap.data().username,
                message: tidbitSnap.data().message,
                timestamp: tidbitSnap.data().timestamp,
              });
            }
          }
        }),
      );

      if (
        JSON.stringify(tidbitsData) !==
        JSON.stringify(dailyFeedSnap.data()?.tidbits)
      ) {
        await setDoc(dailyFeedRef, {
          tidbits: tidbitsData,
          lastUpdated: Timestamp.now(),
        });
      }

      await saveFeedToCache(userId, {
        tidbits: tidbitsData,
        lastUpdated: Timestamp.now().toMillis(),
      });

      setTidbits(tidbitsData);
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
