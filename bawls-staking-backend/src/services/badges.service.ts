export function computeDaysStaked(startTime: number): number {
  if (!startTime) return 0;
  const now = Math.floor(Date.now() / 1000);
  return Math.floor((now - startTime) / 86400);
}

export function computeBadge(startTime: number): string {
  const days = computeDaysStaked(startTime);

  if (days >= 120) return "DIAMOND BAWLER";
  if (days >= 90) return "BAWLER LEGEND";
  if (days >= 60) return "BIG BAWLER";
  if (days >= 30) return "OG BAWLER";
  return "BABY BAWLER";
}

import { fetchAllUserStakes } from './solana.service';

export async function getAllBadges() {
  const users = await fetchAllUserStakes();

  return users  
  .filter(u => u.amount > 0)
  .map(u => ({
    wallet: u.wallet,
    amount: u.amount,
    daysStaked: computeDaysStaked(u.startTime),
    badge: computeBadge(u.startTime)
  }));
}
