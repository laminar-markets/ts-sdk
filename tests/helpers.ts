import { AptosAccount, AptosClient, HexString, Types } from "aptos";
import pino from "pino";

import { createOrderbook, registerUser } from "../src/book";
import { registerCoin } from "../src/coin";
import { initManagedCoin } from "../src/managedCoin";

export const logger = pino();

export const delay = (ms: number) => {
  return new Promise((res) => setTimeout(res, ms));
};

export const logTxnResult = (txn: Types.Transaction) => {
  if ("success" in txn) {
    if (txn.success && "gas_used" in txn) {
      logger.info(`Transaction success (gas used: ${txn.gas_used})`);
    } else {
      logger.error(`Transaction failed, reason: ${txn.vm_status}`);
      logger.debug(txn);
    }
  } else {
    logger.info(`Transaction pending...`);
  }
};

export async function initDexResources(
  client: AptosClient,
  bookOwner: AptosAccount,
  dex: AptosAccount,
  baseTag: string,
  quoteTag: string
) {
  const [resources, dexResouces] = await Promise.all([
    client.getAccountResources(bookOwner.address()),
    client.getAccountResources(dex.address()),
  ]);

  if (
    dexResouces.find(({ type }) => type == `0x1::coin::CoinInfo<${baseTag}>`) ==
    null
  ) {
    logger.info("Initializing FakeBaseCoin");
    const txn = await initManagedCoin(
      client,
      dex,
      baseTag,
      "Base",
      "B",
      6,
      false
    );
    logTxnResult(txn);
  } else {
    logger.info("FakeBaseCoin already initialized.");
  }

  if (
    dexResouces.find(
      ({ type }) => type == `0x1::coin::CoinInfo<${quoteTag}>`
    ) == null
  ) {
    logger.info("Initializing FakeQuoteCoin");
    const txn = await initManagedCoin(
      client,
      dex,
      quoteTag,
      "Quote",
      "Q",
      6,
      false
    );
    logTxnResult(txn);
  } else {
    logger.info("FakeQuoteCoin already initialized.");
  }

  if (
    resources.find(({ type }) => type == `0x1::coin::CoinStore<${baseTag}>`) ==
    null
  ) {
    logger.info("Registering FakeBaseCoin");
    const txn = await registerCoin(client, dex, dex.address(), baseTag);
    logTxnResult(txn);
  } else {
    logger.info("FakeBaseCoin already registered.");
  }

  if (
    resources.find(({ type }) => type == `0x1::coin::CoinStore<${quoteTag}>`) ==
    null
  ) {
    logger.info("Registering FakeQuoteCoin");
    const txn = await registerCoin(client, dex, dex.address(), quoteTag);
    logTxnResult(txn);
  } else {
    logger.info("FakeQuoteCoin already registered.");
  }

  if (
    resources.find(
      ({ type }) => type == `${dex.address()}::book::OrderBookStore`
    ) == null
  ) {
    logger.info("Registering user to orderbook");
    const txn = await registerUser(client, dex, dex.address());
    logTxnResult(txn);
  } else {
    logger.info("User already registered.");
  }

  if (
    resources.find(
      ({ type }) =>
        type ==
        `${bookOwner.address()}::book::OrderBookSigner<${baseTag}, ${quoteTag}>`
    ) == null
  ) {
    logger.info("Creating orderbook");
    const txn = await createOrderbook(
      client,
      bookOwner,
      dex.address(),
      baseTag,
      quoteTag,
      3,
      3,
      1000
    );
    logTxnResult(txn);
  } else {
    logger.info("Orderbook already created.");
  }
}

export async function initUserResources(
  client: AptosClient,
  user: AptosAccount,
  bookOwner: HexString,
  dexAddress: HexString,
  baseTag: string,
  quoteTag: string
) {
  const resources = await client.getAccountResources(user.address());

  if (
    resources.find(({ type }) => type == `0x1::coin::CoinStore<${baseTag}>`) ==
    null
  ) {
    logger.info("Registering FakeBaseCoin");
    const txn = await registerCoin(client, user, dexAddress, baseTag);
    logTxnResult(txn);
  } else {
    logger.info("FakeBaseCoin already registered.");
  }

  if (
    resources.find(({ type }) => type == `0x1::coin::CoinStore<${quoteTag}>`) ==
    null
  ) {
    logger.info("Registering FakeQuoteCoin");
    const txn = await registerCoin(client, user, dexAddress, quoteTag);
    logTxnResult(txn);
  } else {
    logger.info("FakeQuoteCoin already registered.");
  }

  if (
    resources.find(
      ({ type }) => type == `${dexAddress}::book::OrderBookStore`
    ) == null
  ) {
    logger.info("Registering user to orderbook");
    const txn = await registerUser(client, user, dexAddress);
    logTxnResult(txn);
  } else {
    logger.info("User already registered.");
  }
}
