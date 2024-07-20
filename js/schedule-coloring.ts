import { roundRobin } from "./round-robin.js";
import { teams, type Game, type Team, type Teams } from "./types.js";

type GameWithRound = Game & { round: number };

function createGraph(teams: Teams) {
  const rounds = roundRobin(teams).map((round, i) =>
    round.map((game) => ({ ...game, round: i }))
  );
  /**
   * Every game is a node in the graph.
   * The edges are the games that share a team.
   */
  const graph = new Map<GameWithRound, Set<GameWithRound>>();

  const independentSets = rounds;
  const cliques = new Map<Team, GameWithRound[]>();

  // Create cliques: map of teams to games
  for (const round of rounds) {
    for (const game of round) {
      for (const team of [game.home, game.away]) {
        if (!cliques.has(team)) {
          cliques.set(team, []);
        }
        cliques.get(team)!.push(game);
      }
    }
  }

  // Create an adjacency graph
  for (const round of rounds) {
    for (const game of round) {
      graph.set(
        game,
        new Set(
          cliques
            .get(game.home)!
            .concat(cliques.get(game.away)!)
            .filter((g) => g !== game)
        )
      );
    }
  }

  // Model constraints: allow teams to play the same activity twice.
  const cutOff = Math.floor(rounds.length / 2);
  for (const clique of cliques.values()) {
    // a clique is a list of connected games
    for (const game of clique) {
      const isFirstHalf = game.round < cutOff;
      const neighbors = graph.get(game)!;
      for (
        let i = isFirstHalf ? cutOff : 0;
        isFirstHalf ? i < clique.length : i < cutOff;
        i++
      ) {
        const neighbor = clique[i]!;
        // bi-directional delete
        neighbors.delete(neighbor);
        graph.get(neighbor)!.delete(game);
      }
    }
  }

  // Model constraints: connect independent sets
  for (const independentSet of independentSets) {
    for (const node of independentSet) {
      const neighbors = graph.get(node)!;
      for (const game of independentSet.filter((n) => n !== node)) {
        neighbors.add(game);
      }
    }
  }

  return graph;
}

const graph = createGraph(teams);
console.log(graph);

const graphStats = {
  nodes: graph.size,
  edges: [...graph.values()].reduce((acc, edges) => acc + edges.size, 0),
  minDegree: Math.min(...[...graph.values()].map((edges) => edges.size)),
  maxDegree: Math.max(...[...graph.values()].map((edges) => edges.size)),
};
console.table(graphStats);
