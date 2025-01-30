import {Route, Routes, Navigate} from "react-router-dom";
import {Auth} from "./components/auth";
import {ConnectionList} from "./components/connectionList";
import {InviteLinkGenerator} from "./components/inviteLinkGenerator";
import {Invite} from "./pages/invite";
import {auth} from "./lib/firebase";
import {useAuthState} from "react-firebase-hooks/auth";
import {Settings} from "./components/settings";
import {Navbar} from "./components/navbar";
import IndexPage from "./pages";

function App() {
  const [user] = useAuthState(auth);

  return (
    <div style={{backgroundColor: "#660033", minHeight: "100vh"}}>
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
          path="/settings"
          element={user ? <Settings /> : <Navigate to="/" />}
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
    </div>
  );
}

export default App;
