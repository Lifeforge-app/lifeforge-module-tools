import { wait } from "./wait";

/**
 * Clears the console and exits the process after a specified delay.
 * This function waits for a specified number of milliseconds before exiting the process.
 *
 * @param code - The exit code to use when terminating the process. 0 indicates success, while any other number indicates an error.
 */
export const exitProcess = async (code: number) => {
  await wait(1000);
  console.clear();
  process.exit(code);
};
