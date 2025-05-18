import fs from "fs";
import type JSZip from "jszip";

export default function traverse(path: string, rootPath: string, zip: JSZip) {
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
