import {useEffect, useState} from "react";
import {doc, getDoc} from "firebase/firestore";
import {db, auth} from "../lib/firebase";
import {removeConnection} from "../lib/connections";

export const ConnectionList = () => {
  const [connections, setConnections] = useState<{id: string; name: string}[]>(
    [],
  );

  useEffect(() => {
    const fetchConnections = async () => {
      if (!auth.currentUser) return;

      const userId = auth.currentUser.uid;

      const connectionsRef = doc(db, "connections", userId);
      const connectionsSnap = await getDoc(connectionsRef);

      if (!connectionsSnap.exists()) {
        console.warn("⚠️ No connections document found.");
        return;
      }

      const connectionIds = connectionsSnap.data()?.connections || [];

      if (!Array.isArray(connectionIds)) {
        console.error(
          "❌ connectionIds is NOT an array! Check Firestore structure:",
          connectionIds,
        );
        return;
      }

      if (connectionIds.length === 0) {
        console.warn("⚠️ User has no connections.");
        setConnections([]);
        return;
      }

      const connectionProfiles = await Promise.all(
        connectionIds.map(async (connectionId: string) => {
          const userRef = doc(db, "users", connectionId);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            console.warn(`⚠️ User profile missing for: ${connectionId}`);
            return {id: connectionId, name: "Unknown User"};
          }

          return {
            id: connectionId,
            name:
              userSnap.data().name || userSnap.data().email || "Unknown User",
          };
        }),
      );

      setConnections(connectionProfiles);
    };

    fetchConnections();
  }, [auth.currentUser]);

  return (
    <div className="p-8 bg-burgundy text-gray-200">
      {connections.length === 0 ? (
        <div className="w-full flex justify-center">
          <p className="flex w-full max-w-5xl">No connections yet</p>
        </div>
      ) : (
        connections.map((connection) => (
          <div key={connection.id} className="w-full flex justify-center">
            <div className="flex justify-between items-center py-2 border-b w-full max-w-5xl">
              <span>{connection.name}</span>
              <button
                onClick={() => removeConnection(connection.id)}
                className="bg-gold text-black px-4 py-2 rounded"
              >
                Remove
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
