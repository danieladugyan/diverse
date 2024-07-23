import { createGraph } from "./color-scheduling.js";
import { teams, type Game, type Graph } from "./types.js";

function printConstraints(graph: Graph) {
  console.log("int: k;");

  let i = 0;
  const matchIndices = [...graph.keys()].reduce<Map<Game, number>>(
    (acc, game) => {
      console.log("var 1..k:", "match" + i + ";");
      return acc.set(game, i++);
    },
    new Map()
  );

  for (const [node, neighbors] of graph.entries()) {
    for (const neighbor of neighbors) {
      console.log(
        "constraint",
        "match" + matchIndices.get(node),
        "!=",
        "match" + matchIndices.get(neighbor) + ";"
      );
    }
  }

  console.log("solve satisfy;");
}

printConstraints(createGraph(teams));
