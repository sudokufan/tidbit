import {format, isToday, isYesterday, subDays, isSameDay} from "date-fns";

export const getFormattedDate = (date: Date) => {
  const time = format(date, "h:mm aa");
  if (isToday(date)) {
    return `${time} today`;
  } else if (isYesterday(date)) {
    return `${time} yesterday`;
  } else if (isSameDay(date, subDays(new Date(), 2))) {
    return `${time} ${format(date, "EEEE")}`;
  } else if (isSameDay(date, subDays(new Date(), 3))) {
    return `${time} ${format(date, "EEEE")}`;
  } else {
    return `${time} long ago`;
  }
};
