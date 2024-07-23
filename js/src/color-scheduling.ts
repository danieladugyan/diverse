import { roundRobin } from "./round-robin.js";
import {
  activities,
  type Activity,
  type Game,
  type GameWithRound,
  type Graph,
  type Team,
  type Teams,
} from "./types.js";
import { shuffle } from "./utils.js";

export function createGraph(teams: Teams) {
  const rounds = roundRobin(teams).map((round, i) =>
    round.map((game) => ({ ...game, round: i }))
  );
  /**
   * Every game is a node in the graph.
   * The original edges are the games that share a team.
   */
  const graph = new Map<GameWithRound, Set<GameWithRound>>();

  const independentSets = rounds;
  const cliques = teams.reduce<Map<Team, Set<GameWithRound>>>(
    (acc, team) => acc.set(team, new Set()),
    new Map()
  );

  // Set up cliques: map of teams to games
  for (const round of rounds) {
    for (const game of round) {
      for (const team of [game.home, game.away]) {
        cliques.get(team)!.add(game);
      }
    }
  }

  // Create an adjacency graph
  for (const round of rounds) {
    for (const game of round) {
      // Get all games that share a team with the current game
      const neighbors = cliques.get(game.home)!.union(cliques.get(game.away)!);
      neighbors.delete(game);
      graph.set(game, neighbors);
    }
  }

  // Model constraints: allow teams to play the same activity twice.
  // TODO: is there a better way to drop edges?
  const cutOff = Math.floor(rounds.length / 2);
  for (const clique of cliques.values()) {
    // a clique is a list of connected games
    for (const game of clique) {
      const isFirstHalf = game.round < cutOff;
      const neighbors = graph.get(game)!;
      for (
        let i = isFirstHalf ? cutOff : 0;
        isFirstHalf ? i < clique.size : i < cutOff;
        i++
      ) {
        const neighbor = [...clique][i]!;
        // bi-directional delete
        neighbors.delete(neighbor);
        graph.get(neighbor)!.delete(game);
        // TODO: investigate how cliques can stay in sync with graph
        // cliques.get(neighbor.home)!.delete(neighbor);
        // cliques.get(neighbor.away)!.delete(neighbor);
      }
    }
  }

  // Model constraints: connect independent sets
  // No teams play the same activity in the same round
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

function printGraphStats(graph: Graph) {
  const graphStats = {
    nodes: graph.size,
    edges: [...graph.values()].reduce((acc, edges) => acc + edges.size, 0),
    minDegree: Math.min(...[...graph.values()].map((edges) => edges.size)),
    maxDegree: Math.max(...[...graph.values()].map((edges) => edges.size)),
  };
  console.table(graphStats);
}

export function createSchedule(teams: Teams) {
  const graph = createGraph(teams);
  let bestScore = Infinity;
  let bestColoring = new Map<Game, Activity>();
  const nodes = [...graph.keys()];

  printGraphStats(graph);

  const ITERATIONS = 1000000;
  for (let i = 0; i < ITERATIONS; i++) {
    const coloring = new Map<Game, Activity>();
    let unschedulable = 0;
    for (const node of nodes) {
      const neighbors = graph.get(node)!;
      const usedColors = new Set([...neighbors].map((n) => coloring.get(n)));
      const availableColors = new Set(activities).difference(usedColors);
      const color = availableColors.values().next().value;
      if (!color) {
        unschedulable++;
      }
      coloring.set(node, color);
    }
    if (unschedulable < bestScore) {
      bestScore = unschedulable;
      bestColoring = coloring;
      console.log(`Iteration ${i}: ${unschedulable} unschedulable games`);
    }
    shuffle(nodes);
  }

  return bestColoring;
}
