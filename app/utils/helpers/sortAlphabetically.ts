export default function sortAlphabetically<T extends { name: string }>(
  input: T[]
): T[] {
  return input.sort((a, b) =>
    a.name.localeCompare(b.name, "es", { sensitivity: "base" })
  );
}
