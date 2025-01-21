import {doc, setDoc, serverTimestamp} from "firebase/firestore";
import {db, auth} from "./firebase";
import {v4 as uuidv4} from "uuid";

export const generateInviteLink = async (): Promise<string | null> => {
  if (!auth.currentUser) return null;

  const inviteId = uuidv4();
  const inviterId = auth.currentUser.uid;

  const inviteRef = doc(db, "invites", inviteId);

  await setDoc(inviteRef, {
    inviter: inviterId,
    expiresAt: serverTimestamp(),
    duration: 24 * 60 * 60 * 1000,
  });

  return `${window.location.origin}/invite/${inviteId}`;
};
