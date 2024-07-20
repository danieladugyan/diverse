import {
  activities,
  teams,
  type Activity,
  type Game,
  type RoundWithLocations,
  type TeamActivityGraph,
  type Teams,
} from "./types.js";

export function setupActivityGraph(teams: Teams) {
  return Object.fromEntries(
    teams.map((team) => [
      team,
      Object.fromEntries(activities.map((activity) => [activity, 0])),
    ])
  ) as TeamActivityGraph;
}

export function printStats(activityGraph: TeamActivityGraph) {
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

export function printSchedule(schedule: RoundWithLocations[]) {
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
