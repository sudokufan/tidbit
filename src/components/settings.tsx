import {useEffect, useState} from "react";
import {auth, db} from "../lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {useAuthState} from "react-firebase-hooks/auth";
import {EmailAuthProvider, reauthenticateWithCredential} from "firebase/auth";

export const Settings = () => {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchUserProfile = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUsername(userSnap.data().name || "");
      }
    };

    fetchUserProfile();
  }, [user]);

  const updateUsername = async () => {
    if (!user || !username.trim()) return;

    setLoading(true);
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {name: username}, {merge: true});

    alert("Display name updated!");
    setLoading(false);
  };

  const deleteAccount = async () => {
    if (!user) return;

    const confirmation = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );
    if (!confirmation) return;

    setLoading(true);
    const userId = user.uid;

    try {
      if (user.providerData[0]?.providerId === "password") {
        const password = prompt(
          "Please enter your password to confirm deletion:",
        );
        if (!password) {
          alert("Account deletion cancelled.");
          setLoading(false);
          return;
        }

        try {
          const credential = EmailAuthProvider.credential(
            user.email!,
            password,
          );
          await reauthenticateWithCredential(user, credential);
        } catch (reauthError) {
          console.error("❌ Reauthentication failed:", reauthError);
          alert("Reauthentication failed. Please try logging out and back in.");
          setLoading(false);
          return;
        }
      }

      await Promise.all([
        deleteDoc(doc(db, "users", userId)),
        deleteDoc(doc(db, "tidbits", userId)),
        deleteDoc(doc(db, "dailyFeed", userId)),
        deleteDoc(doc(db, "connections", userId)),
      ]);

      const invitesQuery = query(
        collection(db, "invites"),
        where("inviter", "==", userId),
      );
      const invitesSnap = await getDocs(invitesQuery);
      const inviteDeletes = invitesSnap.docs.map((docSnap) =>
        deleteDoc(doc(db, "invites", docSnap.id)),
      );
      await Promise.all(inviteDeletes);

      const allConnectionsSnap = await getDocs(collection(db, "connections"));
      const updates = allConnectionsSnap.docs.map(async (docSnap) => {
        const connections = docSnap.data().connections || [];
        if (connections.includes(userId)) {
          await setDoc(
            doc(db, "connections", docSnap.id),
            {connections: connections.filter((id: string) => id !== userId)},
            {merge: true},
          );
        }
      });
      await Promise.all(updates);

      await user.delete();

      alert("Your account has been deleted.");
    } catch (error: any) {
      console.error("Error deleting account:", error);

      if (error.code === "auth/requires-recent-login") {
        alert(
          "You need to log out and log back in before deleting your account.",
        );
      } else {
        alert("Error deleting account. Try again.");
      }
    }

    setLoading(false);
  };

  if (!user) return <p>Please log in to manage your profile.</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto bg-burgundy text-gray-200">
      <div className="mb-8">
        <label className="block text-sm font-semibold mb-1">Display name</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded w-full text-black"
        />
        <button
          onClick={updateUsername}
          disabled={loading}
          className="mt-2 bg-gold text-black px-4 py-2 rounded w-full"
        >
          Update Display Name
        </button>
      </div>
      <label className="block text-sm font-semibold mb-1">Delete account</label>
      <button
        onClick={deleteAccount}
        className="bg-[#FF5252] text-black px-4 py-2 rounded w-full"
      >
        Delete Account
      </button>
    </div>
  );
};
