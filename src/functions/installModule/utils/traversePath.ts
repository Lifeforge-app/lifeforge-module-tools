import fs from "fs";
import type JSZip from "jszip";

/**
 * Recursively traverses a directory and adds its contents to a JSZip instance.
 *
 * @param path - The path to the directory to traverse.
 * @param rootPath - The root path for the zip structure.
 * @param zip - The JSZip instance to add files and folders to.
 */
export default function traverse(
  path: string,
  rootPath: string,
  zip: JSZip
): void {
  const listing = fs.readdirSync(path);
  for (let item of listing) {
    const itemPath = `${path}/${item}`;
    const isDirectory = fs.lstatSync(itemPath).isDirectory();
    if (isDirectory) {
      const childZip = zip.folder(item);
      traverse(itemPath, rootPath, childZip!);
    } else {
      zip.file(item, fs.readFileSync(itemPath));
    }
  }
}
