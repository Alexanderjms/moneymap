export function formatNumber(n: number, decimals = 2): string {
  const [int, dec] = n.toFixed(decimals).split(".");
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (dec ? "." + dec : "");
}
