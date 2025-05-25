import { DATA_PATH } from "../auth/constants/constant";
import fs from "fs";

/**
 * Stores the provided properties in a JSON file.
 * If the file does not exist, it creates it.
 * If the file exists, it merges the new properties with the existing ones.
 *
 * @param props - An object containing properties to be stored.
 * @throws An error if the file operations fail.
 */
export default function storeProps(props: Record<string, any>): void {
  const propsFilePath = `${DATA_PATH}/props.json`;

  try {
    if (!fs.existsSync(propsFilePath)) {
      fs.mkdirSync(DATA_PATH, { recursive: true });
      fs.writeFileSync(propsFilePath, JSON.stringify({}), "utf-8");
    }

    const existingProps = JSON.parse(fs.readFileSync(propsFilePath, "utf-8"));
    const updatedProps = { ...existingProps, ...props };
    fs.writeFileSync(
      propsFilePath,
      JSON.stringify(updatedProps, null, 2),
      "utf-8"
    );
  } catch (error) {
    throw new Error(`Failed to store props: ${error}`);
  }
}

/**
 * Retrieves the properties from the JSON file by the specified name.
 * If the file does not exist or the property is not found, it returns null.
 *
 * @param propsName - The name of the property to retrieve.
 * @returns The value of the property if found, otherwise null.
 * @throws An error if the file operations fail.
 */
export async function getProps<T>(propsName: string): Promise<T | null> {
  const propsFilePath = `${DATA_PATH}/props.json`;

  try {
    if (!fs.existsSync(propsFilePath)) {
      return null;
    }

    const props = JSON.parse(fs.readFileSync(propsFilePath, "utf-8"));
    return props[propsName] || null;
  } catch (error) {
    throw new Error(`Failed to retrieve props: ${error}`);
  }
}
