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
};

export const TidbitFeed = ({refresh}: TidbitFeedProps) => {
  const [tidbits, setTidbits] = useState<TidbitType[]>([]);
  const [user] = useAuthState(auth);
  // const [sortCriteria, setSortCriteria] = useState<"time" | "username">("time");
  const sortCriteria = "time";

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

  const sortTidbits = (tidbits: TidbitType[]) => {
    return tidbits.sort((a, b) => {
      if (sortCriteria === "time") {
        return b.timestamp.seconds - a.timestamp.seconds;
      } else {
        return a.username.localeCompare(b.username);
      }
    });
  };

  if (!user) return <p>Please log in to see Tidbits.</p>;

  return (
    <div className="p-4 flex flex-col gap-2">
      {/* // add sorting by username or time to settings, defaults to time oldest to newest atm */}
      {/* <div className="flex justify-end mb-4">
        <Select
          label="Sort by"
          selectedKeys={[sortCriteria]}
          onSelectionChange={(keys) =>
            setSortCriteria(keys.currentKey as "time" | "username")
          }
          className="w-[120px]"
        >
          <SelectItem key="time" value="time">
            Time
          </SelectItem>
          <SelectItem key="username" value="username">
            Username
          </SelectItem>
        </Select>
      </div> */}
      {tidbits.length === 0 ? (
        <p className="text-white">No Tidbits from your connections yet.</p>
      ) : (
        sortTidbits(tidbits).map((tidbit) => (
          <Tidbit key={tidbit.id} tidbit={tidbit} />
        ))
      )}
    </div>
  );
};
