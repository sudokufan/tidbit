import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { removeConnection } from "../lib/connections";

export const ConnectionList = () => {
  const [connections, setConnections] = useState<string[]>([]);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!auth.currentUser) return;

      const userId = auth.currentUser.uid;
      const connectionsRef = doc(db, "connections", userId);
      const connectionsSnap = await getDoc(connectionsRef);

      if (connectionsSnap.exists()) {
        setConnections(connectionsSnap.data().connections || []);
      }
    };

    fetchConnections();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Connections</h2>
      {connections.length === 0 ? (
        <p>No connections yet</p>
      ) : (
        connections.map((connectionId) => (
          <div
            key={connectionId}
            className="flex justify-between items-center p-2 border-b"
          >
            <span>{connectionId}</span>
            <button
              onClick={() => removeConnection(connectionId)}
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
