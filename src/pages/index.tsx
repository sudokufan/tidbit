import {TidbitFeed} from "@/components/tidbitFeed";
import {TidbitForm} from "@/components/tidbitForm";
import {useState} from "react";

export default function IndexPage() {
  const [refreshFeed, setRefreshFeed] = useState(false);

  return (
    <div className="flex flex-col items-center p-4">
      <TidbitForm onPostConfirm={() => setRefreshFeed(!refreshFeed)} />
      <TidbitFeed refresh={refreshFeed} />
    </div>
  );
}
