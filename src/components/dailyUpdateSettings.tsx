import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";

export const DailyUpdateSettings = () => {
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    const fetchUpdateTime = async () => {
      if (!auth.currentUser) return;
      const settingsRef = doc(db, "updateTimes", auth.currentUser.uid);
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        setSelectedTime(settingsSnap.data().updateTime || "");
      }
    };

    fetchUpdateTime();
  }, []);

  const saveUpdateTime = async () => {
    if (!auth.currentUser) return;
    const settingsRef = doc(db, "updateTimes", auth.currentUser.uid);
    await setDoc(settingsRef, { updateTime: selectedTime });
    alert("Update time saved!");
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-2">Choose Daily Feed Update Time</h2>
      <input
        type="time"
        value={selectedTime}
        onChange={(e) => setSelectedTime(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <button
        onClick={saveUpdateTime}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded w-full"
      >
        Save Time
      </button>
    </div>
  );
};
