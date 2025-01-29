import {useState} from "react";
import {generateInviteLink} from "../lib/invites";

export const InviteLinkGenerator = () => {
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const handleGenerateLink = async () => {
    const link = await generateInviteLink();
    setInviteLink(link);
  };

  return (
    <div className="p-4">
      <button
        onClick={handleGenerateLink}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Generate Invite Link
      </button>
      {inviteLink && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Share this link (valid for 7 days):
          </p>
          <a
            href={inviteLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            {inviteLink}
          </a>
        </div>
      )}
    </div>
  );
};
