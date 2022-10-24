import { AptosAccount, AptosClient, BCS, TxnBuilderTypes, Types } from "aptos";

import { Side, TimeInForce } from "../types/global";

export async function signSubmitAndWaitFor(
  client: AptosClient,
  account: AptosAccount,
  rawTxn: TxnBuilderTypes.RawTransaction
): Promise<Types.Transaction> {
  const signedTxn = await client.signTransaction(account, rawTxn);
  const pendingTxn = await client.submitTransaction(signedTxn);
  return await client.waitForTransactionWithResult(pendingTxn.hash);
}

export async function sendPayload(
  client: AptosClient,
  account: AptosAccount,
  entryFunctionPayload: TxnBuilderTypes.TransactionPayload
): Promise<Types.Transaction> {
  const [{ sequence_number: sequenceNumber }, chainId] = await Promise.all([
    client.getAccount(account.address()),
    client.getChainId(),
  ]);

  const rawTxn = new TxnBuilderTypes.RawTransaction(
    TxnBuilderTypes.AccountAddress.fromHex(account.address()),
    BigInt(sequenceNumber),
    entryFunctionPayload,
    1000n,
    1n,
    BigInt(Math.floor(Date.now() / 1000) + 10),
    new TxnBuilderTypes.ChainId(chainId)
  );

  const bcsTxn = AptosClient.generateBCSTransaction(account, rawTxn);
  const pendingTxn = await client.submitSignedBCSTransaction(bcsTxn);
  return await client.waitForTransactionWithResult(pendingTxn.hash);
}

export function serializeSide(side: Side): Uint8Array {
  const sideToU8: Record<Side, Uint8Array> = {
    buy: BCS.bcsSerializeU8(0),
    sell: BCS.bcsSerializeU8(1),
  };
  return sideToU8[side];
}

export function serializeTimeInForce(timeInForce: TimeInForce) {
  const timeInForceToU8: Record<TimeInForce, Uint8Array> = {
    gtc: BCS.bcsSerializeU8(0),
    ioc: BCS.bcsSerializeU8(1),
    fok: BCS.bcsSerializeU8(2),
  };
  return timeInForceToU8[timeInForce];
}

export function sideToU8(side: Side): number {
  const sideToU8Map: Record<Side, number> = {
    buy: 0,
    sell: 1,
  };
  return sideToU8Map[side];
}

export function timeInForceToU8(timeInForce: TimeInForce): number {
  const timeInForceToU8Map: Record<TimeInForce, number> = {
    gtc: 0,
    ioc: 1,
    fok: 2,
  };
  return timeInForceToU8Map[timeInForce];
}
