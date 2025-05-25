import fs from "fs";
import { createCredentials } from "./functions/createCredentails";
import { unlockCredentials } from "./functions/unlockCredentials";
import { CREDENTIAL_FILE_PATH, DATA_PATH } from "./constants/constant";
import { t, validateSessionTokenAndGetUserData } from "../api";
import { error } from "../cli";
import ora from "ora";
import prompts from "prompts";
import { exitProcess, wait } from "../cli";
import promptAndStoreForFrontendPath from "../utils/promptAndStoreFrontendFolder";

/**
 * Retrieves the credentials for the API connection.
 * If the credentials file exists, it unlocks the credentials.
 * If the credentials file does not exist, it prompts the user to create new credentials.
 * Session token is validated against the API before returning.
 * If the session token is invalid or expired, the process exits.
 * @returns An object containing the credentials and user data.
 */
export async function getCredentials(): Promise<{
  apiHost: string;
  sessionToken: string;
  userData: Record<string, any>;
}> {
  let credentials: { apiHost: string; sessionToken: string };

  if (fs.existsSync(CREDENTIAL_FILE_PATH)) {
    credentials = await unlockCredentials();
  } else {
    credentials = await createCredentials();
  }

  const userData = await validateSessionTokenAndGetUserData(
    credentials.apiHost,
    credentials.sessionToken
  );

  return {
    apiHost: credentials.apiHost,
    sessionToken: credentials.sessionToken,
    userData: userData!,
  };
}

/**
 * Logs out the user by deleting the session file, and exits the process.
 * Prompts the user for confirmation before proceeding with the logout.
 * If the session file does not exist, it informs the user and exits the process.
 */
export async function logout(): Promise<void> {
  const { confirm } = await prompts({
    type: "confirm",
    name: "confirm",
    message: t("prompts.logoutConfirmation"),
    initial: false,
  });
  if (!confirm) {
    error(t("messages.operationCancelled"));
    await wait(1000);
    return;
  }

  const spinner = ora(t("prompts.loggingOut")).start();
  if (fs.existsSync(DATA_PATH)) {
    fs.rmdirSync(DATA_PATH, { recursive: true });
  } else {
    spinner.fail("No session file found?");
    await exitProcess(1);
  }

  spinner.succeed(t("messages.logoutSuccess"));
  await exitProcess(0);
}
