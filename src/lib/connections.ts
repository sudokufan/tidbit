import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, auth } from "./firebase";

export const addConnection = async (connectionId: string) => {
  if (!auth.currentUser) return;

  const userId = auth.currentUser.uid;
  const userConnectionsRef = doc(db, "connections", userId);

  await updateDoc(userConnectionsRef, {
    connections: arrayUnion(connectionId),
  });

  console.log(`Added connection ${connectionId}`);
};

export const removeConnection = async (connectionId: string) => {
  if (!auth.currentUser) return;

  const userId = auth.currentUser.uid;
  const userConnectionsRef = doc(db, "connections", userId);

  await updateDoc(userConnectionsRef, {
    connections: arrayRemove(connectionId),
  });

  console.log(`Removed connection ${connectionId}`);
};
