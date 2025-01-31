import {useEffect, useState} from "react";
import {doc, getDoc, Timestamp} from "firebase/firestore";
import {db, auth} from "../lib/firebase";
import {useAuthState} from "react-firebase-hooks/auth";
import {
  loadFeedFromLocalStorage,
  saveFeedToLocalStorage,
} from "@/helpers/localStorageFeed";
import {TidbitType} from "@/types/tidbit";
import Tidbit from "./tidbit";

type TidbitFeedProps = {
  refresh: boolean;
  latestTidbitTimestamp?: number | null; // New prop
};

export const TidbitFeed = ({
  refresh,
  latestTidbitTimestamp = 0,
}: TidbitFeedProps) => {
  const [tidbits, setTidbits] = useState<TidbitType[]>([]);
  const [user] = useAuthState(auth);
  const sortCriteria = "time";

  useEffect(() => {
    if (!user) return;
    const fetchFeed = async () => {
      const userId = user.uid;
      const cachedFeed = await loadFeedFromLocalStorage(userId);

      if (cachedFeed && cachedFeed.lastUpdated) {
        if (latestTidbitTimestamp === null) {
          setTidbits(cachedFeed.tidbits || []);
          return;
        }
        if (cachedFeed.lastUpdated < latestTidbitTimestamp) {
          const dailyFeedRef = doc(db, "dailyFeed", userId);
          const dailyFeedSnap = await getDoc(dailyFeedRef);
          setTidbits(dailyFeedSnap.data()?.tidbits || []);
          await saveFeedToLocalStorage(userId, {
            tidbits: dailyFeedSnap.data()?.tidbits,
            lastUpdated: Timestamp.now().toMillis(),
          });
          return;
        } else {
          setTidbits(cachedFeed.tidbits || []);
          return;
        }
      }

      const dailyFeedRef = doc(db, "dailyFeed", userId);
      const dailyFeedSnap = await getDoc(dailyFeedRef);
      setTidbits(dailyFeedSnap.data()?.tidbits || []);
      await saveFeedToLocalStorage(userId, {
        tidbits: dailyFeedSnap.data()?.tidbits,
        lastUpdated: Timestamp.now().toMillis(),
      });
    };
    fetchFeed();
  }, [user, refresh, latestTidbitTimestamp]);

  const sortTidbits = (tidbits: TidbitType[]) => {
    return tidbits.sort((a, b) => {
      if (sortCriteria === "time") {
        return a.timestamp.seconds - b.timestamp.seconds;
      } else {
        return b.username.localeCompare(a.username);
      }
    });
  };

  if (!user) return <p>Please log in to see Tidbits.</p>;

  return (
    <div className="mt-4 flex flex-col gap-3 lg:gap-5 w-full">
      {tidbits.length === 0 ? (
        <p className="text-gray-200">No Tidbits from your connections yet.</p>
      ) : (
        sortTidbits(tidbits).map((tidbit) => (
          <Tidbit key={tidbit.id} tidbit={tidbit} />
        ))
      )}
    </div>
  );
};
