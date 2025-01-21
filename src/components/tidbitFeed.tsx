import {useEffect, useState} from "react";
import {doc, getDoc, setDoc} from "firebase/firestore";
import {db, auth} from "../lib/firebase";
import {useAuthState} from "react-firebase-hooks/auth";

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

  useEffect(() => {
    if (!user) return;

    const fetchFeed = async () => {
      const dailyFeedRef = doc(db, "dailyFeed", user.uid);
      const dailyFeedSnap = await getDoc(dailyFeedRef);
      const updateTimeRef = doc(db, "updateTimes", user.uid);
      const updateTimeSnap = await getDoc(updateTimeRef);

      const now = new Date();
      let shouldUpdate = false;
      let updateTimeStr = "";

      if (!updateTimeSnap.exists()) {
        console.warn(
          "No updateTimes document found for user. Setting default update time.",
        );
        const defaultUpdateTime = "12:00";
        await setDoc(updateTimeRef, {updateTime: defaultUpdateTime});
        updateTimeStr = defaultUpdateTime;
      } else {
        updateTimeStr = updateTimeSnap.data().updateTime;
        const [hours, minutes] = updateTimeStr.split(":").map(Number);
        const updateTimeToday = new Date();
        updateTimeToday.setHours(hours, minutes, 0, 0);

        if (now >= updateTimeToday) {
          shouldUpdate = true;
        }
      }

      if (shouldUpdate || !dailyFeedSnap.exists()) {
        const tidbitsSnap = await getDoc(doc(db, "tidbits", user.uid));
        if (tidbitsSnap.exists()) {
          const tidbitsData = tidbitsSnap.data().tidbits || [];
          await setDoc(dailyFeedRef, {tidbits: tidbitsData});
          setTidbits(tidbitsData);
        } else {
          await setDoc(dailyFeedRef, {tidbits: []});
          setTidbits([]);
        }
      } else {
        setTidbits(dailyFeedSnap.data().tidbits || []);
      }

      setNextUpdate(updateTimeStr);
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
