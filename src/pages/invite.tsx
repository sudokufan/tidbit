import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  deleteDoc,
} from "firebase/firestore";
import {db, auth} from "../lib/firebase";

export const Invite = () => {
  const {inviteId} = useParams<{inviteId: string}>();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Validating invite...");

  useEffect(() => {
    const handleInvite = async () => {
      if (!auth.currentUser || !inviteId) return;

      const inviteRef = doc(db, "invites", inviteId);
      const inviteSnap = await getDoc(inviteRef);

      if (!inviteSnap.exists()) {
        setMessage("Invalid or expired invite.");
        return;
      }

      const {inviter, expiresAt} = inviteSnap.data();

      if (expiresAt.toMillis() < Date.now()) {
        setMessage("This invite has expired.");
        await deleteDoc(inviteRef);
        return;
      }

      const currentUserId = auth.currentUser.uid;

      await Promise.all([
        updateDoc(doc(db, "connections", inviter), {
          connections: arrayUnion(currentUserId),
        }),
        updateDoc(doc(db, "connections", currentUserId), {
          connections: arrayUnion(inviter),
        }),
      ]);

      await deleteDoc(inviteRef);

      setMessage("You are now connected!");
      setTimeout(() => navigate("/"), 2000);
    };

    handleInvite();
  }, [inviteId, navigate]);

  return <div className="p-4 text-center">{message}</div>;
};
