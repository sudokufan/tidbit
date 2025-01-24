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
        console.log("User signed in:", user.uid);
        handleInvite(user);
      }
    });

    return () => unsubscribe();
  }, [inviteId]);

  const handleInvite = async (user: User) => {
    console.log("Checking invite ID:", inviteId);
    if (!inviteId) {
      setMessage("Invalid or expired invite.");
      return;
    }
    const inviteRef = doc(db, "invites", inviteId);
    const inviteSnap = await getDoc(inviteRef);

    if (!inviteSnap.exists()) {
      console.log("Invite does not exist.");
      setMessage("Invalid or expired invite.");
      return;
    }

    const {inviter, expiresAt} = inviteSnap.data();
    console.log("Invite found:", inviteSnap.data());

    if (!expiresAt || expiresAt.toMillis() < Date.now()) {
      console.log("Invite has expired.");
      setMessage("This invite has expired.");
      await deleteDoc(inviteRef);
      return;
    }

    const currentUserId = user.uid;

    console.log(
      "Updating connections for inviter:",
      inviter,
      "and user:",
      currentUserId,
    );

    const userConnectionsRef = doc(db, "connections", currentUserId);

    try {
      await updateDoc(userConnectionsRef, {
        connections: arrayUnion(inviter),
      }).catch(async (err) => {
        if (err.code === "not-found") {
          await setDoc(userConnectionsRef, {connections: [inviter]});
        } else throw err;
      });
      console.log("Connections updated successfully.");

      setMessage("You are now connected!");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("🔥 Firestore error:", error);
      const errorMessage = (error as any).message || "Unknown error";
      setMessage(`Error: ${errorMessage}`);
    }
  };

  return <div className="p-4 text-center">{message}</div>;
};
