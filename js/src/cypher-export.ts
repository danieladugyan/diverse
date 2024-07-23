import { writeFile } from "fs/promises";
import { createGraph } from "./color-scheduling.js";
import { teams, type GameWithRound, type Graph } from "./types.js";

const createNode = (game: GameWithRound, index: number) =>
  `CREATE (match${index}:Game {name: "match${index}", home: "${
    game.home
  }", away: "${game.away}", round: ${game.round + 1}})`;
const createRelationship = (index: number, neighbor: number) =>
  `CREATE (match${index})-[:PLAYS_AGAINST]->(match${neighbor})`;

async function exportCypher(graph: Graph) {
  let cypher = "";

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

  await writeFile("graph.cypher", cypher, "utf8");
}

/**
 * LOAD CSV WITH HEADERS FROM 'file:///nodes.csv' AS row
 * MERGE (game:Game {name: row.id, home: row.home, away: row.away, round: toInteger(row.round)})
 * RETURN
 *   game.name AS name,
 *   game.home AS home,
 *   game.away AS away,
 *   game.round AS round
 */
async function exportCypherNodesCSV(graph: Graph) {
  let csv = "id,home,away,round\n";

  let i = 0;
  const matchIndices = [...graph.keys()].reduce<Map<GameWithRound, number>>(
    (acc, game) => {
      csv += `${i},${game.home},${game.away},${game.round + 1}\n`;
      return acc.set(game, i++);
    },
    new Map()
  );

  await writeFile("nodes.csv", csv, "utf8");
}

/**
 * LOAD CSV WITH HEADERS FROM 'file:///edges.csv' AS row
 * MATCH (match1:Game {name: row.match1})
 * MATCH (match2:Game {name: row.match2})
 * CREATE (match1)-[:CONSTRAINT]->(match2)
 * RETURN
 *  match1.name AS match1,
 *  match2.name AS match2
 */
function exportCypherEdgesCSV(graph: Graph) {
  let csv = "match1,match2\n";

  let i = 0;
  const matchIndices = [...graph.keys()].reduce<Map<GameWithRound, number>>(
    (acc, game) => {
      return acc.set(game, i++);
    },
    new Map()
  );

  for (const [node, neighbors] of graph.entries()) {
    for (const neighbor of neighbors) {
      // avoid bidirectional relationships
      if (matchIndices.get(node)! < matchIndices.get(neighbor)!) {
        csv += `${matchIndices.get(node)},${matchIndices.get(neighbor)}\n`;
      }
    }
  }

  return writeFile("edges.csv", csv, "utf8");
}

const graph = createGraph(teams);
await exportCypher(graph);
await exportCypherNodesCSV(graph);
await exportCypherEdgesCSV(graph);