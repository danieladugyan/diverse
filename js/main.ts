import { roundRobin } from "./round-robin.js";

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

const rounds = roundRobin(teams);

for (const [i, round] of rounds.entries()) {
  console.log('Round', i + 1);
  for (const game of round) {
    console.log(`  ${game.home} vs ${game.away}`);
  }
}