import type { Round, Team } from "./types.js";

export function roundRobin(teams: Iterable<Team>): Round[] {
  const games: Round[] = [];
  const teamsArray = [...teams];
  const n = teamsArray.length;

  if (n % 2 === 1) {
    teamsArray.push("Bye" as Team);
  }

  for (let i = 0; i < n - 1; i++) {
    const round: Round = [];
    for (let j = 0; j < n / 2; j++) {
      round.push({
        home: teamsArray[j]!,
        away: teamsArray[n - 1 - j]!,
      });
    }
    games.push(round);
    teamsArray.splice(1, 0, teamsArray.pop()!);
  }
  return games;
}
