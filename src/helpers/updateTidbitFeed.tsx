import {auth, db} from "@/lib/firebase";
import {TidbitType} from "@/types/tidbit";
import {doc, getDoc, setDoc, Timestamp} from "firebase/firestore";
import {saveFeedToLocalStorage} from "./localStorageFeed";

export const updateTidbitFeed = async () => {
  const user = auth.currentUser;
  if (!user) return;
  const userId = user.uid;
  const connectionsRef = doc(db, "connections", userId);
  const dailyFeedRef = doc(db, "dailyFeed", userId);

  const dailyFeedSnap = await getDoc(dailyFeedRef);

  const connectionsSnap = await getDoc(connectionsRef);
  if (!connectionsSnap.exists()) {
    console.warn("No connections found.");
    await setDoc(dailyFeedRef, {tidbits: [], lastUpdated: Timestamp.now()});
    return;
  }

  const connections = connectionsSnap.data()?.connections || [];
  if (connections.length === 0) {
    console.warn("User has no connections.");
    await setDoc(dailyFeedRef, {tidbits: [], lastUpdated: Timestamp.now()});
    return;
  }

  const tidbitsData: TidbitType[] = [];
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

  await saveFeedToLocalStorage(userId, {
    tidbits: tidbitsData,
    lastUpdated: Timestamp.now().toMillis(),
  });

  return tidbitsData;
};
