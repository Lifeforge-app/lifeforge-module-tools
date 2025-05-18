import axios from "axios";
import ora from "ora";
import { exitProcess, wait } from "../cli";

/**
 * Checks the API status by sending a GET request to the /status endpoint.
 *
 * @param apiHost - The base URL of the API.
 * @returns A promise that resolves to true if the API is reachable, otherwise exits the process.
 */
export async function checkHostStatus(apiHost: string): Promise<true | void> {
  const spinner = ora("Checking API status...").start();

  try {
    const res = await axios.get(`${apiHost}/status`);

    if (res.status === 200) {
      spinner.succeed("API is reachable");
      await wait(1000);
      console.clear();
      return true;
    } else {
      spinner.fail("API is not reachable");
      await exitProcess(1);
    }
  } catch (error) {
    spinner.fail("An error occurred while checking the API status");
    await exitProcess(1);
  }
}
