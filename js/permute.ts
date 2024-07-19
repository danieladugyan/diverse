/**
 * https://stackoverflow.com/a/20871714
 */
export function permute<T>(inputArr: readonly T[]) {
  let result: T[] = [];

  const permute = (arr: readonly T[], m: T[] = []) => {
    if (arr.length === 0) {
      result.push(m as T);
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next));
      }
    }
  };

  permute(inputArr);

  return result;
}