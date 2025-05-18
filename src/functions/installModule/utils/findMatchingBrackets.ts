/**
 * Finds the matching closing bracket for an opening bracket in a string.
 *
 * @param line - The string to search in.
 * @param startIndex - The index of the opening bracket.
 * @returns The index of the matching closing bracket, or -1 if not found.
 */
export default (line: string, startIndex: number) => {
  let openBracket = 0;
  for (let i = startIndex; i < line.length; i++) {
    if (line[i] === "[") {
      openBracket++;
    } else if (line[i] === "]") {
      openBracket--;
      if (openBracket === 0) {
        return i;
      }
    }
  }
  return -1;
};
