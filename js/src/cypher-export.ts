import { createGraph } from "./color-scheduling.js";
import { teams, type GameWithRound, type Graph } from "./types.js";

function printCypher(graph: Graph): string {
  let cypher = "";
  const createNode = (game: GameWithRound, index: number) =>
    `CREATE (match${index}:Game {name: "match${index}", home: "${game.home}", away: "${game.away}", round: ${game.round + 1}})`;
  const createRelationship = (index: number, neighbor: number) =>
    `CREATE (match${index})-[:PLAYS_AGAINST]->(match${neighbor})`;

  let i = 0;
  const matchIndices = [...graph.keys()].reduce<Map<GameWithRound, number>>(
    (acc, game) => {
      cypher += createNode(game, i) + "\n";
      return acc.set(game, i++);
    },
    new Map()
  );

  for (const [node, neighbors] of graph.entries()) {
    for (const neighbor of neighbors) {
      cypher +=
        createRelationship(
          matchIndices.get(node)!,
          matchIndices.get(neighbor)!
        ) + "\n";
    }
  }

  console.log(cypher);
  return cypher;
}

printCypher(createGraph(teams));
