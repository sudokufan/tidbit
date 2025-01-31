import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import {db, auth} from "../lib/firebase";
import {User} from "firebase/auth";

export const Invite = () => {
  const {inviteId} = useParams<{inviteId: string}>();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Validating invite...");

  useEffect(() => {
    if (!inviteId) return;

    console.log("Waiting for auth.currentUser...");
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        handleInvite(user);
      }
    });

    return () => unsubscribe();
  }, [inviteId]);

  const handleInvite = async (user: User) => {
    if (!inviteId) {
      setMessage("Invalid or expired invite.");
      return;
    }

    const inviteRef = doc(db, "invites", inviteId);
    const inviteSnap = await getDoc(inviteRef);

    if (!inviteSnap.exists()) {
      setMessage("Invalid or expired invite.");
      return;
    }

    const {inviter, expiresAt} = inviteSnap.data();

    if (!expiresAt || expiresAt.toMillis() < Date.now()) {
      setMessage("This invite has expired.");
      await deleteDoc(inviteRef);
      return;
    }

    const currentUserId = user.uid;

    const userConnectionsRef = doc(db, "connections", currentUserId);
    const inviterConnectionsRef = doc(db, "connections", inviter);

    try {
      // Add inviter to current user's connections
      await updateDoc(userConnectionsRef, {
        connections: arrayUnion(inviter),
      }).catch(async (err) => {
        if (err.code === "not-found") {
          await setDoc(userConnectionsRef, {connections: [inviter]});
        } else throw err;
      });

      // Add current user to inviter's connections
      await updateDoc(inviterConnectionsRef, {
        connections: arrayUnion(currentUserId),
      }).catch(async (err) => {
        if (err.code === "not-found") {
          await setDoc(inviterConnectionsRef, {connections: [currentUserId]});
        } else throw err;
      });

      console.log("✅ Connections updated successfully.");

      setMessage("🎉 You are now connected!");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("🔥 Firestore error:", error);
      const errorMessage = (error as any).message || "Unknown error";
      setMessage(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="p-4 bg-burgundy text-gray-200 text-center">{message}</div>
  );
};
