import {Link} from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="p-4 bg-gray-800 text-white flex justify-between">
      <Link to="/dashboard" className="px-4">
        Dashboard
      </Link>
      <Link to="/settings/daily-update" className="px-4">
        Daily Update
      </Link>
      <Link to="/settings/connections" className="px-4">
        Connections
      </Link>
      <Link to="/settings/invite" className="px-4">
        Invite
      </Link>
    </nav>
  );
};
