/** 名次徽章：前三名為金、銀、銅，其餘為一般底色 */
export const MEDAL_CLASS: Readonly<Record<number, string>> = {
  1: "bg-gold text-ink",
  2: "bg-silver text-ink",
  3: "bg-bronze text-ink",
};

export const DEFAULT_MEDAL_CLASS = "bg-raised text-secondary";
