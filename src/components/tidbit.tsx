import React from "react";
import {Card, CardBody} from "@heroui/react";
import {TidbitType} from "@/types/tidbit";
import {formatDistanceToNowStrict} from "date-fns";

type TidbitItemProps = {
  tidbit: TidbitType;
  formatTimeLeft?: () => string;
};

const Tidbit: React.FC<TidbitItemProps> = ({tidbit, formatTimeLeft}) => {
  const timestampDate = new Date(
    tidbit.timestamp.seconds * 1000 + tidbit.timestamp.nanoseconds / 1000000,
  );
  const timeSince = formatDistanceToNowStrict(timestampDate, {addSuffix: true});
  return (
    <Card shadow="md" radius="lg" isHoverable className="w-full bg-gray-100">
      <CardBody className="flex flex-row items-center">
        <div className="text-4xl mr-4">{tidbit.emoji}</div>
        <div className="flex-1">
          <div className="flex gap-2 items-baseline mb-1">
            <span className="text-md font-semibold">{tidbit.username}</span>
            <span className="text-small text-default-500">{timeSince}</span>
          </div>
          <p className="text-default-700">{tidbit.message}</p>
          {formatTimeLeft && (
            <p className="text-sm text-gray-500 mt-2">{formatTimeLeft()}</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default Tidbit;
