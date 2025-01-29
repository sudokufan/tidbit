import {Route, Routes, Navigate} from "react-router-dom";
import {Auth} from "./components/auth";
import {DailyUpdateSettings} from "./components/dailyUpdateSettings";
import {ConnectionList} from "./components/connectionList";
import {InviteLinkGenerator} from "./components/inviteLinkGenerator";
import {Invite} from "./pages/invite";
import {auth} from "./lib/firebase";
import {useAuthState} from "react-firebase-hooks/auth";
import {Profile} from "./components/profile";
import {Navbar} from "./components/navbar";
import IndexPage from "./pages";

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
          element={user ? <IndexPage /> : <Navigate to="/" />}
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
