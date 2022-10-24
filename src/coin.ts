import { AptosAccount, AptosClient, HexString, Types } from "aptos";

import { dexAddress, defaultOptions } from "./constants";
import { signSubmitAndWaitFor } from "./util";

/**
 * Registers a coin type on an account. This must be run before the account
 * is able to hold any coins of the specified type.
 *
 * @param client - the Aptos client
 * @param account - The account to register the CoinType on.
 * @param tag - The tag for the coin the user wishes to hold.
 * @returns - A promise containing the transaction.
 */
export async function registerCoin(
  client: AptosClient,
  account: AptosAccount,
  tag: string
): Promise<Types.Transaction> {
  const rawTxn = await client.generateTransaction(
    account.address(),
    {
      function: `${dexAddress}::coin::register`,
      type_arguments: [tag],
      arguments: [],
    },
    defaultOptions
  );
  return await signSubmitAndWaitFor(client, account, rawTxn);
}

export async function getBalance(
  client: AptosClient,
  address: HexString,
  tag: string
): Promise<number> {
  const res: any = await client.getAccountResource(
    address,
    `0x1::coin::CoinStore<${tag}>`
  );
  return parseInt(res.data.coin.value);
}
