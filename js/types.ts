export type Game = {
  home: string;
  away: string;
};

export type Round = Game[];

export type GameWithLocation = Game & {
  location: string;
};

export type RoundWithLocations = GameWithLocation[];