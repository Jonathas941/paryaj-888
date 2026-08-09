import { PoolClient } from "pg";
import { unprocessable, notFound } from "../utils/errors";
import { money } from "../utils/money";

export type TxType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "BET_STAKE"
  | "BET_PAYOUT"
  | "BET_REFUND"
  | "ADJUSTMENT"
  | "BONUS";

export interface WalletRow {
  id: string;
  user_id: string;
  currency: string;
  available_balance: string;
  locked_balance: string;
  bonus_balance: string;
  updated_at: string;
}

/**
 * Locks the user's wallet row FOR UPDATE and returns it.
 *
 * Every balance mutation must start here. The row lock serialises concurrent
 * requests for the same wallet, which is what stops two simultaneous bets
 * from both passing a balance check and overdrawing the account.
 */
export async function lockWallet(client: PoolClient, userId: string): Promise<WalletRow> {
  const { rows } = await client.query<WalletRow>(
    "SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE",
    [userId]
  );
  if (!rows.length) throw notFound("Wallet not found for this account.");
  return rows[0];
}

export async function ensureWallet(client: PoolClient, userId: string, currency = "USD") {
  await client.query(
    `INSERT INTO wallets (user_id, currency) VALUES ($1, $2)
     ON CONFLICT (user_id, currency) DO NOTHING`,
    [userId, currency]
  );
}

/**
 * Moves money and writes the matching ledger row in one step.
 *
 * The balance is computed by Postgres (`available_balance + $amount`), never
 * read into JS and written back, so no read-modify-write race exists. The
 * CHECK (available_balance >= 0) constraint is the final backstop: an
 * over-debit raises and rolls the whole transaction back.
 *
 * Must be called inside `transaction()`.
 */
export async function postTransaction(
  client: PoolClient,
  opts: {
    userId: string;
    walletId: string;
    type: TxType;
    direction: "DEBIT" | "CREDIT";
    amount: number;
    currency?: string;
    referenceType?: string;
    referenceId?: string;
    status?: "PENDING" | "COMPLETED";
  }
) {
  const amount = money(opts.amount);
  if (parseFloat(amount) <= 0) {
    throw unprocessable("INVALID_AMOUNT", "Transaction amount must be greater than zero.");
  }

  const delta = opts.direction === "DEBIT" ? `- ${amount}::numeric` : `+ ${amount}::numeric`;

  let updated;
  try {
    const res = await client.query<{ available_balance: string }>(
      `UPDATE wallets
          SET available_balance = available_balance ${delta},
              updated_at = now()
        WHERE id = $1
        RETURNING available_balance`,
      [opts.walletId]
    );
    updated = res.rows[0];
  } catch (err: any) {
    // 23514 = check_violation, i.e. the balance would have gone negative.
    if (err.code === "23514") {
      throw unprocessable("INSUFFICIENT_FUNDS", "You do not have enough available balance.");
    }
    throw err;
  }

  const { rows } = await client.query(
    `INSERT INTO wallet_transactions
       (wallet_id, user_id, type, direction, amount, currency, status, balance_after, reference_type, reference_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      opts.walletId,
      opts.userId,
      opts.type,
      opts.direction,
      amount,
      opts.currency || "USD",
      opts.status || "COMPLETED",
      updated.available_balance,
      opts.referenceType || null,
      opts.referenceId || null
    ]
  );

  return { transaction: rows[0], balanceAfter: updated.available_balance };
}

/** Moves funds from available into locked (used while a withdrawal is pending). */
export async function lockFunds(client: PoolClient, walletId: string, amount: number) {
  try {
    await client.query(
      `UPDATE wallets
          SET available_balance = available_balance - $2::numeric,
              locked_balance    = locked_balance + $2::numeric,
              updated_at = now()
        WHERE id = $1`,
      [walletId, money(amount)]
    );
  } catch (err: any) {
    if (err.code === "23514") {
      throw unprocessable("INSUFFICIENT_FUNDS", "You do not have enough available balance.");
    }
    throw err;
  }
}

/** Releases locked funds back to available (withdrawal rejected/cancelled). */
export async function releaseFunds(client: PoolClient, walletId: string, amount: number) {
  await client.query(
    `UPDATE wallets
        SET available_balance = available_balance + $2::numeric,
            locked_balance    = locked_balance - $2::numeric,
            updated_at = now()
      WHERE id = $1`,
    [walletId, money(amount)]
  );
}

/** Burns locked funds once a withdrawal is actually paid out. */
export async function settleLockedFunds(client: PoolClient, walletId: string, amount: number) {
  await client.query(
    `UPDATE wallets
        SET locked_balance = locked_balance - $2::numeric,
            updated_at = now()
      WHERE id = $1`,
    [walletId, money(amount)]
  );
}
