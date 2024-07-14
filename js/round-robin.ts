export function roundRobin(teams: Set<string>): [string, string][][] {
    const games: [string, string][][] = [];
    const teamsArray = [...teams];
    const n = teamsArray.length;
    
    if (n % 2 === 1) {
        teamsArray.push("Bye");
    }

    for (let i = 0; i < n - 1; i++) {
        const round: [string, string][] = [];
        for (let j = 0; j < n / 2; j++) {
            round.push([teamsArray[j]!, teamsArray[n - 1 - j]!]);
        }
        games.push(round);
        teamsArray.splice(1, 0, teamsArray.pop()!);
    }
    return games;
}

// const teams = new Set(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]);
// const rounds = roundRobin(teams);
// for (let i = 0; i < rounds.length; i++) {
//     console.log("Round", i + 1);
//     for (const game of rounds[i]!) {
//         console.log(game[0], "vs", game[1]);
//     }
//     console.log();
// }