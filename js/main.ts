import { roundRobin } from "./round-robin.js";
import {
  activities,
  teams,
  type Activity,
  type Game,
  type RoundWithLocations,
  type Team,
  type TeamActivityGraph,
  type Teams,
} from "./types.js";

function getSortRoundByMatCountFn(activityGraph: TeamActivityGraph) {
  return (a: Game, b: Game) => {
    const count1 = activityGraph[a.home]["Mat"] + activityGraph[a.away]["Mat"];
    const count2 = activityGraph[b.home]["Mat"] + activityGraph[b.away]["Mat"];
    return count1 - count2;
  };
}

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
      // No team should eat more than once
      if (a === "Mat" && (count1 == 1 || count2 == 1)) {
        continue;
      }

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
    const sortFn = getSortRoundByMatCountFn(activityGraph);
    for (const game of round.toSorted(sortFn)) {
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

function printStats(activityGraph: TeamActivityGraph) {
  const stats = Object.entries(activityGraph).reduce<
    Record<number, { actual: number; ideal: number }>
  >((acc, [, activities]) => {
    for (const count of Object.values(activities)) {
      acc[count] ??= { actual: 0, ideal: NaN };
      acc[count].actual += 1;
    }
    return acc;
  }, {});

  if (1 in stats) {
    stats[1].ideal = teams.length;
  }

  if (2 in stats) {
    stats[2].ideal = teams.length * activities.length - teams.length;
  }

  if (3 in stats) {
    stats[3].ideal = 0;
  }

  console.table(stats, ["actual", "ideal"]);
}

function printSchedule(schedule: RoundWithLocations[]) {
  for (const [i, round] of schedule.entries()) {
    console.log("Round", i + 1);
    console.table(
      round.reduce<Partial<Record<Activity, Game>>>((acc, game) => {
        acc[game.location] = { home: game.home, away: game.away };
        return acc;
      }, {})
    );
  }
}

const { schedule, activityGraph } = createSchedule(teams);
console.log("\nACTIVITY TABLE");
console.table(activityGraph);
console.log();

console.log("ACTIVITY TABLE STATS");
printStats(activityGraph);
console.log();

console.log("SCHEDULE");
printSchedule(schedule);
console.log();
