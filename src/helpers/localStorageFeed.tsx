import {Preferences} from "@capacitor/preferences";

export const saveFeedToLocalStorage = async (userId: string, data: any) => {
  await Preferences.set({
    key: `dailyFeed_${userId}`,
    value: JSON.stringify(data),
  });
};

export const loadFeedFromLocalStorage = async (userId: string) => {
  const result = await Preferences.get({key: `dailyFeed_${userId}`});
  return result.value ? JSON.parse(result.value) : null;
};
