import axios from "axios";
import ora from "ora";
import { exitProcess } from "../cli";

var translations: Record<string, any> = {};

/**
 * Translates a given key using the loaded translations.
 * If the key is not found, it returns the key itself.
 *
 * @param key - The translation key to be translated.
 * @returns The translated string if found, otherwise the key itself.
 */
export function t(key: string): string {
  try {
    const keys = key.split(".");
    let value = translations;
    for (const k of keys) {
      value = value[k];
    }
    return typeof value === "string" ? value : key;
  } catch {
    return key;
  }
}

/**
 * Fetches translations from the API and stores them in the `translations` variable.
 *
 * @param apiHost - The base URL of the API.
 * @param lang - The language code for the translations.
 */
export async function fetchTranslation(
  apiHost: string,
  lang: string
): Promise<void> {
  const spinner = ora(`Fetching translations for "${lang}"...`).start();
  try {
    const response = await axios.get<Record<string, any>>(
      `${apiHost}/locales/${lang}/utils.moduleTools`
    );

    if (response.status !== 200) {
      throw new Error("Failed to fetch translations");
    }

    translations = response.data;

    spinner.succeed(`Fetched translations for "${lang}"`);
  } catch (error) {
    spinner.fail(`Failed to fetch translations for "${lang}"`);
    await exitProcess(1);
  }
}
