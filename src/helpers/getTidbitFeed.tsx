import {auth, db} from "@/lib/firebase";
import {Tidbit} from "@/types/tidbit";
import {doc, getDoc, setDoc, Timestamp} from "firebase/firestore";
import {useAuthState} from "react-firebase-hooks/auth";

export const getTidbitFeed = async () => {
  const [user] = useAuthState(auth);
  if (!user) return;
  const userId = user.uid;
  const connectionsRef = doc(db, "connections", userId);
  const dailyFeedRef = doc(db, "dailyFeed", userId);

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

  return tidbitsData;
};
