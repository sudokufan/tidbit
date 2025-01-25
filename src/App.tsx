import {Route, Routes, Navigate} from "react-router-dom";
import {Auth} from "./components/auth";
import {TidbitForm} from "./components/tidbitForm";
import {TidbitFeed} from "./components/tidbitFeed";
import {DailyUpdateSettings} from "./components/dailyUpdateSettings";
import {ConnectionList} from "./components/connectionList";
import {InviteLinkGenerator} from "./components/inviteLinkGenerator";
import {Invite} from "./pages/invite";
import {auth} from "./lib/firebase";
import {useAuthState} from "react-firebase-hooks/auth";
import {Profile} from "./components/profile";
import Navbar from "./components/navbar";

function App() {
  const [user] = useAuthState(auth);

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Auth />}
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <div className="flex flex-col items-center p-4">
                <TidbitForm />
                <TidbitFeed />
              </div>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/" />}
        />
        <Route
          path="/settings/daily-update"
          element={user ? <DailyUpdateSettings /> : <Navigate to="/" />}
        />
        <Route
          path="/settings/connections"
          element={user ? <ConnectionList /> : <Navigate to="/" />}
        />
        <Route
          path="/settings/invite"
          element={user ? <InviteLinkGenerator /> : <Navigate to="/" />}
        />
        <Route path="/invite/:inviteId" element={<Invite />} />
      </Routes>
    </>
  );
}

export default App;
