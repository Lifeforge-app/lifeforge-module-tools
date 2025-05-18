import axios from "axios";
import ora from "ora";
import { exitProcess, wait } from "../cli";

/**
 * Validates the login credentials against the API.
 *
 * @param apiHost - The base URL of the API.
 * @param email - The email address of the user.
 * @param password - The password of the user.
 * @returns An object containing the status and data if successful, otherwise exits the process.
 */
export async function validateLogin(
  apiHost: string,
  email: string,
  password: string
): Promise<{
  status: "success" | "2fa_required";
  data: string | null;
}> {
  const spinner = ora("Validating credentials...").start();

  try {
    const res = await axios.post(`${apiHost}/user/auth/login`, {
      email,
      password,
    });

    let status: "success" | "2fa_required" | undefined = undefined;
    let data: string | null = null;

    switch (res.status) {
      case 200:
        const { state } = res.data;
        if (state === "2fa_required") {
          status = "2fa_required";
          data = res.data.tid;
        } else if (state === "success") {
          status = "success";
          data = res.data.session;
        } else {
          spinner.fail("Unexpected response state");
          await exitProcess(1);
        }
        spinner.succeed("Credentials validated successfully");
        await wait(1000);
        console.clear();

        break;
      case 401:
        spinner.fail("Invalid credentials");
        await exitProcess(1);
        break;
      default:
        spinner.fail("An unexpected error occurred");
        await exitProcess(1);
    }

    return { status: status!, data };
  } catch (error) {
    spinner.fail("An error occurred while validating credentials");
    await exitProcess(1);
    return { status: "success", data: null }; // This line will never be reached, just to satisfy TypeScript lol
  }
}
