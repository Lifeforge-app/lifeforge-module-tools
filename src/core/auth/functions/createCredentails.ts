import fs from "fs";
import prompts from "prompts";
import { checkHostStatus, validateLogin, perform2FA } from "../../api";
import { error, exitProcess, success } from "../../cli";
import { encrypt } from "../../security";
import { CREDENTIAL_FILE_PATH, DATA_PATH } from "../constants/constant";

/**
 * Prompts the user for their API host, email, and password, and creates encrypted credentials.
 * API host and user credentials are validated against the LifeForge API during the process.
 * @returns An object containing the API host and session token if successful, otherwise exits the process.
 */
export async function createCredentials(): Promise<{
  apiHost: string;
  sessionToken: string;
}> {
  const { apiHost } = await prompts(
    [
      {
        type: "text",
        name: "apiHost",
        message: "Enter LifeForge. API Host",
      },
    ],
    {
      onCancel: async () => {
        error("Operation cancelled");
        await exitProcess(1);
      },
    }
  );

  await checkHostStatus(apiHost);

  const { email, password } = await prompts(
    [
      {
        type: "text",
        name: "email",
        message: "Enter your email address",
      },
      {
        type: "password",
        name: "password",
        message: "Enter your password",
      },
    ],
    {
      onCancel: async () => {
        error("Operation cancelled");
        await exitProcess(1);
      },
    }
  );

  const { status, data } = await validateLogin(apiHost, email, password);

  let sessionToken: string | null = null;

  switch (status) {
    case "success":
      success("Login successful");
      sessionToken = data;
      break;
    case "2fa_required":
      sessionToken = await perform2FA(apiHost, data!);
      break;
    default:
      error("Unexpected response state");
      await exitProcess(1);
  }

  if (!sessionToken) {
    error("Failed to retrieve session token");
    await exitProcess(1);
  }

  const { masterPassword, confirmPassword } = await prompts(
    [
      {
        type: "password",
        name: "masterPassword",
        message: "Set a master password",
      },
      {
        type: "password",
        name: "confirmPassword",
        message: "Confirm master password",
      },
    ],
    {
      onCancel: async () => {
        error("Operation cancelled");
        await exitProcess(1);
      },
    }
  );

  if (masterPassword !== confirmPassword) {
    error("Passwords do not match");
    await exitProcess(1);
  }

  const toEncrypt = Buffer.from(
    JSON.stringify({
      apiHost: apiHost,
      sessionToken,
    })
  );

  fs.mkdirSync(DATA_PATH, { recursive: true });
  fs.writeFileSync(CREDENTIAL_FILE_PATH, encrypt(toEncrypt, masterPassword));
  success("Credentials saved successfully");

  return {
    apiHost,
    sessionToken: sessionToken!,
  };
}
