import {TidbitFeed} from "@/components/tidbitFeed";
import {TidbitForm} from "@/components/tidbitForm";
import {useState, useEffect} from "react";
import UsernameModal from "@/components/usernameModal";
import {doc, getDoc, setDoc} from "firebase/firestore";
import {auth, db} from "@/lib/firebase";
import {useAuthState} from "react-firebase-hooks/auth";

export default function IndexPage() {
  const [refreshFeed, setRefreshFeed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchUserProfile = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUsername(userData.name || null);
      } else {
        setIsModalOpen(true);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleSaveUsername = async (username: string) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {name: username}, {merge: true});

    setUsername(username);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex justify-center w-full bg-burgundy px-8">
        <div className="flex flex-col mt-8 items-center max-w-[1024px] w-full">
          <TidbitForm
            onPostConfirm={() => setRefreshFeed(!refreshFeed)}
            disabled={!username}
          />
          <TidbitFeed refresh={refreshFeed} />
        </div>
      </div>
      <UsernameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUsername}
      />
    </>
  );
}
