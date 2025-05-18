import envPaths from "env-paths";
import path from "path";

// Cross-platform data storage path for lifeforge-dev-tools
export const DATA_PATH = envPaths("lifeforge-dev-tools").data;

// Encrypted credentials will be stored here
export const CREDENTIAL_FILE_PATH = path.join(DATA_PATH, "credentials.bin");
