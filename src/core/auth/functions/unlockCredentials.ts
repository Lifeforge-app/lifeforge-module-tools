import fs from "fs";
import prompts from "prompts";
import { success, error, exitProcess } from "../../cli";
import { decrypt } from "../../security";
import { CREDENTIAL_FILE_PATH } from "../constants/constant";

/**
 * Unlocks the credentials file by prompting the user for their master password.
 * @returns An object containing the API host and session token if successful, otherwise exits the process.
 */
export async function unlockCredentials(): Promise<{
  apiHost: string;
  sessionToken: string;
}> {
  const { masterPassword } = await prompts({
    type: "password",
    name: "masterPassword",
    message: "Enter your master password",
  });

  const encrypted = fs.readFileSync(CREDENTIAL_FILE_PATH);
  try {
    const decrypted = decrypt(encrypted, masterPassword);
    success("Credentials loaded successfully");

    const { sessionToken, apiHost } = JSON.parse(decrypted.toString());

    return { apiHost, sessionToken };
  } catch {
    error("Invalid master password or corrupted file");
    await exitProcess(1);

    return { apiHost: "", sessionToken: "" }; // This line will never be reached, just to satisfy TypeScript lol
  }
}
