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
      console.log("🔍 Fetching connections for:", userId);

      const connectionsRef = doc(db, "connections", userId);
      const connectionsSnap = await getDoc(connectionsRef);

      if (!connectionsSnap.exists()) {
        console.warn("⚠️ No connections document found.");
        return;
      }

      const connectionIds = connectionsSnap.data()?.connections || [];
      console.log("✅ Connection IDs:", connectionIds);

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

      console.log("🔄 Fetching user profiles for connection IDs...");
      const connectionProfiles = await Promise.all(
        (Array.isArray(connectionIds) ? connectionIds : []).map(
          async (connectionId: string) => {
            const userRef = doc(db, "users", connectionId);
            const userSnap = await getDoc(userRef);

            console.log(`🔎 Checking user profile for: ${connectionId}`);

            if (!userSnap.exists()) {
              console.warn(`⚠️ User profile missing for: ${connectionId}`);
              return {id: connectionId, name: "Unknown User"};
            }

            console.log(`✅ Found user profile:`, userSnap.data());

            return {
              id: connectionId,
              name:
                userSnap.data().name || userSnap.data().email || "Unknown User",
            };
          },
        ),
      );

      console.log("✅ Retrieved Connection Profiles:", connectionProfiles);
      setConnections(connectionProfiles);
    };

    fetchConnections();
  }, [auth.currentUser]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Connections</h2>
      {connections.length === 0 ? (
        <p>No connections yet</p>
      ) : (
        connections.map((connection) => (
          <div
            key={connection.id}
            className="flex justify-between items-center p-2 border-b"
          >
            <span>{connection.name}</span>
            <button
              onClick={() => removeConnection(connection.id)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Remove
            </button>
          </div>
        ))
      )}
    </div>
  );
};
