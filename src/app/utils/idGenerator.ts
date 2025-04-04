const MAX_LEN = 5;

export function idGenerate(): string {
  let ans = "";
  const subset = "1234567890qazwsxedcrfvtgbyhnujmiklop";
  for (let i = 0; i < MAX_LEN; i++) {
    ans += subset[Math.floor(Math.random() * subset.length)];
  }
  return ans;
}
