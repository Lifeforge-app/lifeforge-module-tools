import axios from "axios";
import ora from "ora";
import fs from "fs";
import { DATA_PATH } from "../auth/constants/constant";
import { exitProcess, info } from "../cli";

/**
 * Validates the session token against the API and retrieves user information.
 *
 * @param apiHost - The base URL of the API.
 * @param sessionToken - The session token to validate.
 * @returns A promise that resolves to the user information if the token is valid, otherwise exits the process.
 */
export async function validateSessionTokenAndGetUserData(
  apiHost: string,
  sessionToken: string
): Promise<Record<string, any> | void> {
  const spinner = ora("Validating session token...").start();

  try {
    const res = await axios.post(
      `${apiHost}/user/auth/verify`,
      {},
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      }
    );

    if (res.status === 200) {
      spinner.succeed("Session token is valid");
      return res.data.userData;
    } else {
      spinner.fail(
        "Session token is invalid or expired. The session file will be deleted."
      );

      // Delete the session file if it exists
      if (fs.existsSync(DATA_PATH)) {
        fs.unlinkSync(DATA_PATH);
        info("Session file deleted successfully.");
      }
      await exitProcess(1);
    }
  } catch (error) {
    spinner.fail("An error occurred while validating the session token");
    await exitProcess(1);
  }
}
