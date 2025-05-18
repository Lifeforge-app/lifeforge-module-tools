import chalk from "chalk";

/**
 *
 * @param message - The message to log.
 * @returns void
 * @description Logs a message to the console with a green checkmark.
 */
export function success(message: string): void {
  console.log(`${chalk.green("✔")} ${message}`);
}

/**
 *
 * @param message - The message to log.
 * @returns void
 * @description Logs a message to the console with a red cross.
 */
export function error(message: string): void {
  console.error(`${chalk.red("✖")} ${message}`);
}

export function info(message: string): void {
  console.log(`${chalk.blue("ℹ")} ${message}`);
}
