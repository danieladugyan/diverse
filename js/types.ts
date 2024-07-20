export const teams = [
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
export const activities = [
  "Fotboll",
  "Volleyboll",
  "Schack",
  "Frisbee",
  "Spökboll",
  "Mat",
] as const;

export type Team = (typeof teams)[number];
export type Teams = typeof teams;
export type Activity = (typeof activities)[number];

export type Game = {
  home: Team;
  away: Team;
};

export type Round = Game[];

export type GameWithLocation = Game & {
  location: Activity;
};

export type RoundWithLocations = GameWithLocation[];

export type TeamActivityGraph = {
  [key in Team]: {
    [key in Activity]: number;
  };
};

export type GameWithRound = Game & { round: number };
export type Graph = Map<GameWithRound, Set<GameWithRound>>;
