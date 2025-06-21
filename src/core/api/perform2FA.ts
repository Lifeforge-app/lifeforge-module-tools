import prompts from "prompts";
import axios from "axios";
import ora from "ora";
import { error, exitProcess, wait } from "../cli";

/**
 * Prompts the user for a 2FA code and performs the 2FA verification.
 *
 * @param apiHost - The base URL of the API.
 * @param transactionId - The transaction ID received from the login response.
 * @returns The session token if 2FA is successful, otherwise exits the process.
 */
export async function perform2FA(
  apiHost: string,
  transactionId: string
): Promise<string> {
  const { twoFactorCode } = await prompts(
    {
      type: "text",
      name: "twoFactorCode",
      message: "Enter the 2FA code from your authenticator app",
    },
    {
      onCancel: async () => {
        error("Operation cancelled");
        await exitProcess(1);
      },
    }
  );

  const spinner = ora("Validating 2FA code...").start();

  try {
    const res = await axios.post(`${apiHost}/user/2fa/verify`, {
      tid: transactionId,
      otp: twoFactorCode,
      type: "app",
    });

    res.data = res.data.data;

    if (res.status === 200) {
      spinner.succeed("2FA code validated successfully");

      await wait(1000);
      console.clear();

      const { session } = res.data;
      return session;
    } else {
      spinner.fail("Invalid 2FA code");
      await exitProcess(1);

      return ""; // This line will never be reached, just to satisfy TypeScript lol
    }
  } catch (error) {
    spinner.fail("An error occurred while validating 2FA code");
    await exitProcess(1);

    return ""; // This line will never be reached, just to satisfy TypeScript lol
  }
}
