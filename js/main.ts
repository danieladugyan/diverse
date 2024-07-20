import { createSchedule } from "./greedy-scheduling.js";
import { teams } from "./types.js";
import { printSchedule, printStats } from "./utils.js";

const { schedule, activityGraph } = createSchedule(teams);
console.log("\nACTIVITY TABLE");
console.table(activityGraph);
console.log();

console.log("ACTIVITY TABLE STATS");
printStats(activityGraph);
console.log();

console.log("SCHEDULE");
printSchedule(schedule);
console.log();
