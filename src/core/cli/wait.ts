/**
 * Waits for a specified number of milliseconds.
 * This function returns a promise that resolves after the specified time.
 * It can be used to create a delay in asynchronous code execution.
 *
 * @param ms - The number of milliseconds to wait.
 * @returns A promise that resolves after the specified time.
 * @example
 * wait(1000).then(() => {
 *   console.log("Waited for 1 second");
 * });
 */
export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
