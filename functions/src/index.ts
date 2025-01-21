import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import {firestore} from "firebase-admin";

admin.initializeApp();

interface UserDocData {
  updateTime: string;
}

interface UserConnectionsData {
  connections: string[];
}

interface Tidbit {
  timestamp: firestore.Timestamp;
  userId: string;
  [key: string]: unknown;
}

exports.updateDailyFeed = functions.pubsub
  .schedule("every 1 hours")
  .onRun(async () => {
    const db = admin.firestore();

    const usersSnapshot = await db.collection("updateTimes").get();

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const {updateTime} = userDoc.data() as UserDocData;

      if (!updateTime) continue;

      const [userHour, userMinute] = updateTime.split(":").map(Number);

      if (userHour === currentHour && userMinute === currentMinute) {
        const userConnectionsRef = db.collection("connections").doc(userId);
        const userConnectionsSnap = await userConnectionsRef.get();

        if (!userConnectionsSnap.exists) continue;
        const {connections} = userConnectionsSnap.data() as UserConnectionsData;

        if (!connections || connections.length === 0) continue;

        const tidbitsSnapshot = await db
          .collection("tidbits")
          .where("userId", "in", connections)
          .orderBy("timestamp", "desc")
          .get();

        const latestTidbits: {[key: string]: Tidbit} = {};

        tidbitsSnapshot.docs.forEach((doc) => {
          const tidbit = doc.data() as Tidbit;
          if (!latestTidbits[tidbit.userId]) {
            latestTidbits[tidbit.userId] = tidbit;
          }
        });

        const dailyFeedRef = db.collection("dailyFeed").doc(userId);
        await dailyFeedRef.set({tidbits: Object.values(latestTidbits)});
      }
    }

    return null;
  });
