// Recomputes KOL win-rate/avg-return and smart-wallet win-rate from stored
// price snapshots — this is what makes the Leaderboard and Smart Money
// numbers real instead of hand-typed seed values. It does NOT fetch live
// prices itself (see lib/refreshPrices.js for that); it just works off
// whatever price_at_call / price_at_tx / tokens.price_usd already exist.

export async function computeKolStats(sql) {
  const rows = await sql`
    select c.kol_id, c.price_at_call, t.price_usd
    from calls c
    join tokens t on t.address = c.token_address
    where c.price_at_call is not null and t.price_usd is not null
  `;

  const byKol = new Map();
  for (const r of rows) {
    if (!byKol.has(r.kol_id)) byKol.set(r.kol_id, []);
    const pctReturn = ((Number(r.price_usd) - Number(r.price_at_call)) / Number(r.price_at_call)) * 100;
    byKol.get(r.kol_id).push(pctReturn);
  }

  let updated = 0;
  for (const [kolId, returns] of byKol) {
    const totalCalls = returns.length;
    const wins = returns.filter((r) => r > 0).length;
    const winRate = (wins / totalCalls) * 100;
    const avgReturn = returns.reduce((a, b) => a + b, 0) / totalCalls;

    await sql`
      insert into kol_stats (kol_id, win_rate, avg_return, total_calls)
      values (${kolId}, ${winRate}, ${avgReturn}, ${totalCalls})
      on conflict (kol_id) do update set
        win_rate = excluded.win_rate, avg_return = excluded.avg_return,
        total_calls = excluded.total_calls, updated_at = now()
    `;
    updated++;
  }

  return { kolsUpdated: updated };
}

export async function computeWalletStats(sql) {
  const rows = await sql`
    select a.wallet_id, a.price_at_tx, t.price_usd
    from wallet_activities a
    join tokens t on t.address = a.token_address
    where a.action = 'buy' and a.price_at_tx is not null and t.price_usd is not null
  `;

  const byWallet = new Map();
  for (const r of rows) {
    if (!byWallet.has(r.wallet_id)) byWallet.set(r.wallet_id, []);
    const won = Number(r.price_usd) > Number(r.price_at_tx);
    byWallet.get(r.wallet_id).push(won);
  }

  let updated = 0;
  for (const [walletId, outcomes] of byWallet) {
    const winRate = (outcomes.filter(Boolean).length / outcomes.length) * 100;
    await sql`
      update smart_wallets set win_rate_estimate = ${winRate} where id = ${walletId}
    `;
    updated++;
  }

  return { walletsUpdated: updated };
}

export async function computeAllStats(sql) {
  const kol = await computeKolStats(sql);
  const wallet = await computeWalletStats(sql);
  return { ...kol, ...wallet };
}
