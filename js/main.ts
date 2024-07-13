type Game = {
  team1: string;
  team2: string;
  activity: string;
};

type Round = Game[];

const teams = [
  "Grupp 1",
  "Grupp 2",
  "Grupp 3",
  "Grupp 4",
  "Grupp 5",
  "Grupp 6",
  "Grupp 7",
  "Grupp 8",
  "Grupp 9",
  "Grupp 10",
  "Grupp 11",
  "Grupp 12",
] as const;
const activities = ["1", "2", "3", "4", "5", "6"] as const;

type Team = (typeof teams)[number];
type Activity = (typeof activities)[number];
/**
 * A graph where all teams have edges
 * to all activities and all other teams.
 */
const graph: Record<
  Team,
  {
    opponents: Set<Team>;
    activities: Set<Activity>;
  }
> = {} as any;
for (const team of teams) {
  graph[team] = {
    opponents: new Set(teams),
    activities: new Set(activities),
  };
  graph[team].opponents.delete(team);
}

/**
 * TODO: Maybe there are smarter ways to pick teams
 */
function chooseTeam(teams: Set<Team>): Team {
  // return [...teams][0]!;
  return [...teams][Math.floor(Math.random() * teams.size)]!;
}

/**
 * TODO: Maybe there are smarter ways to pick activities
 */
function chooseActivity(activities: Set<Activity>): Activity {
  // return [...activities][0]!;
  return [...activities][Math.floor(Math.random() * activities.size)]!;
}

function makeGame(team1: Team, team2: Team, activity: Activity): Game {
  graph[team1].opponents.delete(team2);
  graph[team2].opponents.delete(team1);
  graph[team1].activities.delete(activity);
  graph[team2].activities.delete(activity);
  return { team1, team2, activity };
}

function printGame(game: Game) {
  console.log(game.team1, "vs", game.team2, "in activity", game.activity);
}

const rounds: Round[] = [];
while (true) {
  const freeTeams = new Set(teams);
  const freeActivities = new Set(activities);
  const round = [];

  console.log("Round", rounds.length + 1);

  while (freeTeams.size > 0) {
    // 1. Pick a team
    const team = chooseTeam(freeTeams);
    freeTeams.delete(team);
    const teamNode = graph[team]!;

    // 2. Look for a suitable opponent
    for (const potentialOpponent of teamNode.opponents.intersection(
      freeTeams
    )) {
      const opponentActivities = graph[potentialOpponent].activities;
      const possibleActivities = opponentActivities
        .intersection(teamNode.activities)
        .intersection(freeActivities);

      // 3. If there is a common activity, schedule the game
      if (possibleActivities.size > 0) {
        const activity = chooseActivity(possibleActivities);
        freeActivities.delete(activity);
        freeTeams.delete(potentialOpponent);

        const game = makeGame(team, potentialOpponent, activity);
        round.push(game);
        printGame(game);
        break;
      }
    }
  }

  if (round.length === 0) {
    console.log("No more games can be scheduled");
    console.log("---------------------------------");
    break;
  }

  rounds.push(round);
}

for (const team of teams) {
  console.log(
    team,
    "has not played",
    [...graph[team].opponents].join(", "),
    "and not visited",
    [...graph[team].activities].join(", ")
  );
}
