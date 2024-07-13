from dataclasses import dataclass, field
from time import sleep
from typing import Optional

# There are essentially two separate problems here:
# 1. How to match teams against each other
# 2. How to match games to places


@dataclass
class Place:
    name: str
    # previous_teams: list["Team"] = field(default_factory=list)


@dataclass
class Team:
    name: str
    previous_opponents: list["Team"] = field(default_factory=list)

    def get_opponent_preferrence(self, teams: list["Team"]) -> list["Team"]:
        return sorted(
            [team for team in teams if team != self],
            key=lambda team: self.previous_opponents.count(team),
            reverse=True,
        )

    def get_preferred_opponent(self, current: "Team", new: "Team") -> "Team":
        return (
            current
            if self.previous_opponents.count(current)
            <= self.previous_opponents.count(new)
            else new
        )


@dataclass
class Game:
    team1: Team
    team2: Team
    place: Optional[Place] = None


@dataclass
class Round:
    name: str
    games: list[Game] = field(default_factory=list)

    # def __str__(self):
    #     s = "| " + "-" * 30 + "\n"
    #     s += f"| Round {self.name}:\n"
    #     s += "| " + "-" * 30 + "\n| "
    #     s += "\n| ".join([str(game) for game in self.games])
    #     s += "\n| " + "-" * 30 + "\n"
    #     if teams := self.unmatched_teams(TEAMS):
    #         s += f"| Unmatched teams: {' '.join([str(team) for team in teams])}\n"
    #     # if places := self.empty_places(SPORTS):
    #     #     s += f"| Unoccupied places: {' '.join([str(place) for place in places])}\n"
    #     s += "| " + "-" * 30
    #     return s

    def unmatched_teams(self, teams: list[Team]) -> list[Team]:
        return [
            team
            for team in teams
            if not any(game.team1 == team or game.team2 == team for game in self.games)
        ]

    def is_full(self, teams: list[Team]) -> bool:
        return len(self.unmatched_teams(teams)) == 0

    def find_opponent(self, team: Team) -> Team:
        for game in self.games:
            if game.team1 == team:
                return game.team2
            if game.team2 == team:
                return game.team1

        raise Exception(f"Team {team} not found in round {self}")

    def add_game(self, team1: Team, team2: Team):
        self.games.append(Game(team1, team2))
        team1.previous_opponents.append(team2)
        team2.previous_opponents.append(team1)

    def remove_game(self, team1: Team, team2: Team):
        game = [
            game
            for game in self.games
            if (game.team1 == team1 and game.team2 == team2)
            or (game.team1 == team2 and game.team2 == team1)
        ][0]
        self.games.remove(game)
        team1.previous_opponents.remove(team2)
        team2.previous_opponents.remove(team1)


STABEN = Team("Staben")
TEAMS = [Team(f"Phaddergrupp {i + 1}") for i in range(11)]
TEAMS.append(STABEN)

r = Round("1")
while not r.is_full(TEAMS):
    unmatched_teams = r.unmatched_teams(TEAMS)
    m = unmatched_teams.pop()
    
    w = m.get_opponent_preferrence(TEAMS).pop()
    
    print(m, w)
    sleep(1)

    if w in unmatched_teams:
        r.add_game(m, w)
    else:
        m_prime = r.find_opponent(w)
        if w.get_preferred_opponent(m_prime, m) == m:
            r.remove_game(m_prime, w)
            r.add_game(m, w)
# print(r)
