import {useState} from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {doc, setDoc, getDoc} from "firebase/firestore";
import {auth, db} from "../lib/firebase";
import {Input, Button} from "@heroui/react";

export const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);

  const ensureUserDocuments = async (userId: string) => {
    const userConnectionsRef = doc(db, "connections", userId);

    const userConnectionsSnap = await getDoc(userConnectionsRef);
    if (!userConnectionsSnap.exists()) {
      await setDoc(userConnectionsRef, {connections: []});
    }
  };
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    if (user) {
      await ensureUserDocuments(user.uid);
    }
  };

  const handleEmailAuth = async () => {
    let user;
    if (isSignUp) {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      user = userCredential.user;
    } else {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      user = userCredential.user;
    }

    if (user) {
      await ensureUserDocuments(user.uid);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="mx-[10vh] md:mx-[20vh] lg:mx-[40vh] xl:mx-[60vh] w-full">
        <div className="flex flex-col text-gold font-bold">
          <span className="text-5xl">tidbit</span>
          <span className="text-md">connected, not distracted</span>
        </div>
        <div className="mt-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-2"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-2"
          />
          <Button onClick={handleEmailAuth} className="w-full mb-2 bg-gold">
            {isSignUp ? "Sign Up" : "Log In"}
          </Button>
          <p
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-gold underline cursor-pointer"
          >
            {isSignUp
              ? "Already have an account? Log In"
              : "Don't have an account? Sign Up"}
          </p>
        </div>
        <hr className="my-4" />
        <Button onClick={handleGoogleSignIn} className="w-full bg-[#FF5252]">
          Sign in with Google
        </Button>
      </div>
    </div>
  );
};
