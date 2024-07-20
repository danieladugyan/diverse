import { createSchedule } from "./color-scheduling.js";
import { teams } from "./types.js";
import { printSchedule, printStats } from "./utils.js";

const coloring = createSchedule(teams)
console.log(coloring)
