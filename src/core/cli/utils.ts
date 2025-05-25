import chalk from "chalk";
import { t } from "../api";
import { wait } from "./wait";

/**
 * Clears the console and exits the process after a specified delay.
 * This function waits for a specified number of milliseconds before exiting the process.
 *
 * @param code - The exit code to use when terminating the process. 0 indicates success, while any other number indicates an error.
 */
export const exitProcess = async (code: number): Promise<never> => {
  await wait(1000);
  console.clear();
  process.exit(code);
};

export const pressAnyKeyToContinue = async () => {
  console.log(chalk.yellow(t("messages.pressAnyKeyToContinue")));

  await new Promise((resolve) => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", () => {
      resolve(true);
    });
  });
};
