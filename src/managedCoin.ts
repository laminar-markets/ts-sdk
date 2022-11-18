import { AptosAccount, AptosClient, HexString, Types } from "aptos";

import { defaultOptions, signSubmitAndWaitFor } from "./util";

/**
 * Initialize a managed coin that can be used for testing.
 *
 * @param client - the Aptos client
 * @param account - The account to hold mint and burn capabilities for the coin.
 * @param tag - The tag for the managed coin. Should be under the address of `account`.
 * @param name - The name of the managed coin.
 * @param symbol - The symbol for the managed coin.
 * @param decimals - Number of decimal places in coin amount.
 * @param monitorSupply - Whether to monitor coin supply.
 * @returns - A promise containing the transaction hash.
 */
export async function initManagedCoin(
  client: AptosClient,
  account: AptosAccount,
  tag: string,
  name: string,
  symbol: string,
  decimals: number,
  monitorSupply: boolean
): Promise<Types.Transaction> {
  const rawTxn = await client.generateTransaction(
    account.address(),
    {
      function: "0x1::managed_coin::initialize",
      type_arguments: [tag],
      arguments: [name, symbol, decimals, monitorSupply],
    },
    defaultOptions
  );
  return await signSubmitAndWaitFor(client, account, rawTxn);
}

export async function mintManagedCoin(
  client: AptosClient,
  account: AptosAccount,
  tag: string,
  destination: HexString,
  amount: number
): Promise<Types.Transaction> {
  const rawTxn = await client.generateTransaction(
    account.address(),
    {
      function: "0x1::managed_coin::mint",
      type_arguments: [tag],
      arguments: [destination, amount],
    },
    defaultOptions
  );
  return await signSubmitAndWaitFor(client, account, rawTxn);
}
