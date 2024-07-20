## Future work

- Maximum k-Differential Coloring Problem: how to make sure that no team has to move far between games.
  [kdiff.pdf](https://www2.cs.arizona.edu/~kobourov/kdiff.pdf)

## Unsatisfiable constraints?

Recall that in our line graph, every node is a game. By modelling the constraints outlined below we can reason about the minimum node degree, and thus the minimum number of colors needed for a proper vertex coloring. For simplicity, we'll assume n=12 below.

1. Every match must have an edge to every other match in the same round. This represents the constraint that no games in one round can be playing the same activity. This adds 5 neighbours.
2. Every match must also have an edge to every other match, in the same half of rounds, that also features one of the teams in the match. For each round, two matches will be played that feature one of the teams. We'll round down and say that half of the rounds is 5 rounds. This therefore adds 10 neighbours.

In summary, every match will be adjacent to 15 other matches. Therefore, it is not possible to schedule the tournament with only 6 activities.

EDIT: In edge coloring this would have been true, but this is of course not true for vertex coloring. The search continues!

## Mapping edges to vertices

The tournament is currently modeled as a graph where each node represents a team and every edge represents a pairing of teams, i.e a game. To solve the scheduling problem using vertex coloring instead of edge coloring, we must find the edge-to-vertex dual.

To create a [line graph](https://en.wikipedia.org/wiki/Line_graph), convert each edge to a node. Then, connect up all nodes who's corresponding edges intersect at a node (in the original graph). Or equivalently, connect up all match nodes that feature the same team.

A (maximal) [clique](<https://en.wikipedia.org/wiki/Clique_(graph_theory)>) in this graph would be a subset of vertices (=matches) who are all connected (=feature the same team). With this understanding, it is easy to see that for n teams there must be n cliques of size n-1, corresponding to the n-1 matches for each of the n teams.

An [independent set](<https://en.wikipedia.org/wiki/Independent_set_(graph_theory)>) in this graph, which is the opposite of a clique, would be a subset of vertices (=matches) that are not connected (=do not feature the same team). With this understanding, it is easy to see that for n teams there must be n-1 independent sets of size n/2 – corresponding to the n-1 rounds (containing n/2 matches) of our tournament.

Note that every node (match) in every clique (all games for a team) will correspond to different independent sets (rounds).

### Modelling constraints

With this background in mind, for every independent set, add edges such that it becomes a clique. This reflects the constraint that every round must assign unique colors to all of its matches. Recall that these independent sets had size n/2.

Additionally, for every original clique, delete half of the edges. This reflects the weaker coloring constraint that two adjacent nodes may have the same color, but the frequency of a color in a clique may not exceed two (every team may play the same sport at most 2 times). Recall that these cliques had size n-1.

## Activity permutations

The simplest way to approach the problem is to assign each of the (n-1)\*(n/2) games a choice of activity. There are 6 activities to choose from, 66 independent choices, yielding 6^66 = 2.3e+51 choices...

But the choices of activities are in fact not independent. We can't pick the same activity for every game in a round. So instead, consider one permutation as an ordered assignment of 6 activities to 6 matches. There are 6! = 720 ways of assigning 6 activities to 6 matches.
So, the first round can be construed in 720 ways, as can the second, and the third, and so on up until 11 rounds have been completed. This is a search space of 720^11 = 2.7e+31....still not great.

### Example

A round will select a permutation of activities.

1. rounds 1~11 pick permutation 0
2. rounds 2~11 pick permutation 0, 1 picks permutation 1
3. rounds 2~11 pick permutation 0, 1 picks permutation 2
4. rounds 2~11 pick permutation 0, 1 picks permutation 3

| R1  | R2  | R3  | R4  | R5  | R6  | R7  | R8  | R9  | R10 | R11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   |
| 1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   |
| 2   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| 720 | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   |
| 0   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   |
| 1   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| 720 | 720 | 720 | 720 | 720 | 720 | 720 | 720 | 720 | 720 | 720 |

## Round-robin permutations

(12 choose 2) + (10 choose 2) + (8 choose 2) + (6 choose 2) + (4 choose 2) + (2 choose 2) = 161 ways to pick teams for the first round

[Edge coloring and round-robin](<https://math.libretexts.org/Bookshelves/Combinatorics_and_Discrete_Mathematics/Combinatorics_(Morris)/03%3A_Graph_Theory/14%3A_Graph_Coloring/14.01%3A_Edge_Coloring>)

## Attempting brute-forcing scheduling

### Example

Assume teams A~D and activities 1~4.

Round 1

| Home | Away | LocHome    | LocAway    | Location |
| ---- | ---- | ---------- | ---------- | -------- |
| A    | B    | 1, 2, 3, 4 | 1, 2, 3, 4 | 1        |
| C    | D    | 1, 2, 3, 4 | 1, 2, 3, 4 | 2        |

Round 2

| Home | Away | LocHome | LocAway | Location |
| ---- | ---- | ------- | ------- | -------- |
| A    | C    | 2, 3, 4 | 1, 3, 4 | 3        |
| B    | D    | 2, 3, 4 | 1, 3, 4 | 4        |

Round 3

| Home | Away | LocHome | LocAway | Location |
| ---- | ---- | ------- | ------- | -------- |
| A    | D    | 2, 4    | 1, 3    | ?        |
| B    | C    | 2, 3    | 1, 4    | ?        |

In round 3, A wants to play D at 2 or 4. However, D has already played activities 2 and 4 and wants to play 1 or 3.

This will always be the case (?).

For every round team A plays, their remaining opponents plays an additional activity that A is not playing (?).
