import {TidbitForm} from "@/components/tidbitForm";
import {TidbitFeed} from "@/components/tidbitFeed";

export default function IndexPage() {
  return (
    <div className="flex flex-col items-center p-4">
      <TidbitForm />
      <TidbitFeed />
    </div>
  );
}
