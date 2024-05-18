import random


class Place:
    def __init__(self, name: str):
        self.name = name

    def __str__(self):
        return self.name

    def __eq__(self, value: object) -> bool:
        if isinstance(value, Place):
            return self.name == value.name
        return False


class Team:
    def __init__(self, name: str):
        self.name = name

    def __str__(self):
        return self.name

    def __eq__(self, value: object) -> bool:
        if isinstance(value, Team):
            return self.name == value.name
        return False

    def __hash__(self) -> int:
        return hash(self.name)


class Game:
    def __init__(self, team1: Team, team2: Team, place: Place):
        self.team1 = team1
        self.team2 = team2
        self.place = place

    def __str__(self):
        return f"{self.team1} vs {self.team2} at {self.place}"


class Round:
    def __init__(self, number: int, games: list[Game]):
        self.number = number
        self.games = games

    def __str__(self):
        s = "| " + "-" * 30 + "\n"
        s += f"| Round {self.number}:\n"
        s += "| " + "-" * 30 + "\n| "
        s += "\n| ".join([str(game) for game in self.games])
        s += "\n| " + "-" * 30 + "\n"
        if teams := self.missing_games(TEAMS):
            s += f"| Unmatched teams: {' '.join([str(team) for team in teams])}\n"
        if places := self.empty_places(SPORTS):
            s += f"| Unoccupied places: {' '.join([str(place) for place in places])}\n"
        s += "| " + "-" * 30
        return s

    def add_game(self, team1: Team, team2: Team, place: Place):
        self.games.append(Game(team1, team2, place))

    def missing_games(self, teams: list[Team]) -> list[Team]:
        return [
            team
            for team in teams
            if not any(game.team1 == team or game.team2 == team for game in self.games)
        ]

    def empty_places(self, places: list[Place]) -> list[Place]:
        return [
            place
            for place in places
            if not any(game.place == place for game in self.games)
        ]


class Schedule:
    def __init__(self, rounds: list[Round] = [], teams=[]):
        self.rounds = rounds
        self.teams = teams

    def __str__(self):
        return "\n\n".join([str(round) for round in self.rounds])

    def add_round(self, round: Round):
        self.rounds.append(round)

    def has_played_at_place(self, team: Team, place: Place) -> bool:
        for round in self.rounds:
            for game in round.games:
                if (game.team1 == team or game.team2 == team) and game.place == place:
                    return True
        return False

    def has_eaten(self, team: Team) -> bool:
        return self.has_played_at_place(team, Place("Mat"))

    def has_not_eaten(self) -> list[Team]:
        return [team for team in self.teams if not self.has_eaten(team)]

    def teams_have_been_fed(self) -> bool:
        return len(self.has_not_eaten()) == 0

    def has_played(self, team1: Team, team2: Team) -> bool:
        for round in self.rounds:
            for game in round.games:
                if (game.team1 == team1 and game.team2 == team2) or (
                    game.team1 == team2 and game.team2 == team1
                ):
                    return True
        return False

    def number_of_games(self, team1: Team, team2: Team) -> int:
        count = 0
        for round in self.rounds:
            for game in round.games:
                if (game.team1 == team1 and game.team2 == team2) or (
                    game.team1 == team2 and game.team2 == team1
                ):
                    count += 1
        return count

    def has_not_played(self, team1: Team) -> list[Team]:
        return [
            team2
            for team2 in self.teams
            if not self.has_played(team1, team2) and team1 != team2
        ]

    def has_played_staben(self, team: Team) -> bool:
        return self.has_played(team, STABEN) or self.has_played(team, STABEN2)

    def has_not_played_staben(self) -> list[Team]:
        return [
            team
            for team in self.teams
            if not self.has_played_staben(team) and (team != STABEN and team != STABEN2)
        ]

    def all_teams_have_played_staben(self) -> bool:
        return len(self.has_not_played_staben()) == 0

    def add_game_against_staben(self, round):
        team1 = random.choice(self.has_not_played_staben())
        # team2 = random.choice([STABEN, STABEN2])
        team2 = STABEN
        place = random.choice(SPORTS)
        round.add_game(team1, team2, place)
    
    def add_game_break(self, round):
        team1 = random.choice(self.has_not_eaten())
        team2 = WALKOVER
        place = MAT
        round.add_game(team1, team2, place)
    
    def add_games(self, round):
        while len(round.missing_games(schedule.teams)) > 0:
            unmatched_teams = round.missing_games(schedule.teams)
            team1 = random.choice(unmatched_teams)
            unmatched_teams.remove(team1)
            potential_opponents = sorted(
                unmatched_teams,
                key=lambda team: schedule.number_of_games(team1, team),
            )
            if len(potential_opponents) == 0:
                raise Exception(
                    f"No more opponents available for {team1} in round:\n" + str(round)
                )
            team2 = random.choice(potential_opponents)

            unoccupied_places = round.empty_places(SPORTS)
            if len(unoccupied_places) == 0:
                raise Exception("No more places available in round:\n" + str(round))
            place = random.choice(unoccupied_places)

            round.add_game(team1, team2, place)


if __name__ == "__main__":
    SPORTS = [
        Place(place)
        for place in [
            "Spökboll",
            "Fotboll",
            "Schack",
            "Brännboll",
            "Handboll",
            "Frisbee",
        ]
    ]
    MAT = Place("Mat")
    # SPORTS.append(MAT)

    STABEN = Team("Staben")
    STABEN2 = Team("Staben 2")
    WALKOVER = Team("Walkover")

    TEAMS = [Team(f"Phaddergrupp {i + 1}") for i in range(11)]
    TEAMS.append(STABEN)
    # TEAMS.append(STABEN2)
    # TEAMS.append(WALKOVER)

    schedule = Schedule(teams=TEAMS)
    i = 0
    while not schedule.all_teams_have_played_staben():
        i += 1
        round = Round(i, [])

        schedule.add_game_against_staben(round)
        schedule.add_game_break(round)
        schedule.add_games(round)

        schedule.add_round(round)

    print(schedule)
