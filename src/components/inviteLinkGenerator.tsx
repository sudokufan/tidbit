import {useState} from "react";
import {generateInviteLink} from "../lib/invites";

export const InviteLinkGenerator = () => {
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const handleGenerateLink = async () => {
    const link = await generateInviteLink();
    setInviteLink(link);
  };

  return (
    <div className="p-8 w-full justify-center flex">
      <div className="w-full max-w-5xl bg-burgundy text-gray-200">
        <button
          onClick={handleGenerateLink}
          className="bg-gold text-black px-4 py-2 rounded"
        >
          Generate Invite Link
        </button>
        {inviteLink && (
          <div className="mt-4">
            <p className="text-sm">Share this link (valid for 7 days):</p>
            <a
              href={inviteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold underline"
            >
              {inviteLink}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
