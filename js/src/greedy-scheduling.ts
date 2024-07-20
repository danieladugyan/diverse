import { roundRobin } from "./round-robin.js";
import {
  type Team,
  type Activity,
  type TeamActivityGraph,
  type Teams,
  activities,
  type RoundWithLocations,
  teams,
} from "./types.js";
import { setupActivityGraph } from "./utils.js";

/**
 * Picks an activity for a game between two teams.
 * Choose the activity that has been played the least amount of times by the two teams.
 */
function pickActivity(
  team1: Team,
  team2: Team,
  available: Set<Activity>,
  activityGraph: TeamActivityGraph
): Activity {
  let min = Number.MAX_SAFE_INTEGER;
  let activity: Activity | undefined = undefined;
  for (const a of available) {
    const count1 = activityGraph[team1][a];
    const count2 = activityGraph[team2][a];
    const count = count1 + count2;
    if (count < min) {
      min = count;
      activity = a;
    }
  }

  if (!activity) {
    throw new Error("No activity found");
  }

  return activity;
}

export function createSchedule(teams: Teams) {
  const rounds = roundRobin(teams);
  const schedule: RoundWithLocations[] = [];
  const activityGraph = setupActivityGraph(teams);

  for (const round of rounds) {
    const available = new Set(activities);
    const roundWithLocations: RoundWithLocations = [];
    for (const game of round) {
      const activity = pickActivity(
        game.home,
        game.away,
        available,
        activityGraph
      );
      activityGraph[game.home][activity]++;
      activityGraph[game.away][activity]++;
      available.delete(activity);
      roundWithLocations.push({ ...game, location: activity });
    }
    schedule.push(roundWithLocations);
  }
  return { schedule, activityGraph };
}
