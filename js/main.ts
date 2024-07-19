import { roundRobin } from "./round-robin.js";
import {
  activities,
  teams,
  type Activity,
  type RoundWithLocations,
  type Team,
  type TeamActivityGraph,
  type Teams,
} from "./types.js";

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
    const count = activityGraph[team1][a] + activityGraph[team2][a];
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

function createSchedule(teams: Teams) {
  const rounds = roundRobin(teams);
  const schedule: RoundWithLocations[] = [];
  const activityGraph = Object.fromEntries(
    teams.map((team) => [
      team,
      Object.fromEntries(activities.map((activity) => [activity, 0])),
    ])
  ) as TeamActivityGraph;

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

function printSchedule(schedule: RoundWithLocations[]) {
  for (const [i, round] of schedule.entries()) {
    console.log("Round", i + 1);
    for (const game of round) {
      console.log(
        `  ${game.location.padEnd(10)} | ${game.home.padEnd(
          2
        )} vs ${game.away.padEnd(2)}`
      );
    }
  }
}

const { schedule, activityGraph } = createSchedule(teams);
console.log("\nACTIVITY TABLE");
console.table(activityGraph);
console.log();

console.log("SCHEDULE");
printSchedule(schedule);
console.log();
