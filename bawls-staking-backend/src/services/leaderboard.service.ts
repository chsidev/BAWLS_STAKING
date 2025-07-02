import { fetchAllUserStakes } from './solana.service';
import { computeBadge, computeDaysStaked } from './badges.service';

export async function getLeaderboard() {
  const users = await fetchAllUserStakes();

  const enriched = users
  .filter(u => u.amount > 0)
  .map(u => ({
    ...u,
    daysStaked: computeDaysStaked(u.startTime),
    badge: computeBadge(u.startTime)
  }));

  return enriched
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 20)
    .map((u, index) => ({
      ...u,
      rank: index + 1,
    }));
}
