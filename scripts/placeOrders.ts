import { AptosAccount, AptosClient, FaucetClient, Types } from "aptos";
import {
  dexAddress,
  dexPrivateKey,
  faucetUrl,
  nodeUrl,
} from "../tests/constants";
import { getBidsBookTop, placeLimitOrder } from "../src/book";
import { initDexResources, initUserResources, logger } from "../tests/helpers";
import { getBalance } from "../src/coin";
import { mintManagedCoin } from "../src/managedCoin";

const logTxnResult = (txn: Types.Transaction) => {
  if ("success" in txn && "vm_status" in txn) {
    logger.info(`success? ${txn.success}, status: ${txn.vm_status}`);
  } else {
    logger.info("transaction pending...");
  }
};

async function main() {
  const client = new AptosClient(nodeUrl);
  const faucetClient = new FaucetClient(nodeUrl, faucetUrl);

  const dex = new AptosAccount(dexPrivateKey, dexAddress);

  const baseTag = `${dexAddress}::coin::FakeBaseCoin`;
  const quoteTag = `${dexAddress}::coin::FakeQuoteCoin`;

  await initDexResources(client, dex, dex, baseTag, quoteTag);
  logger.info("dex resources initialized.");

  const user = new AptosAccount();
  await faucetClient.fundAccount(user.address(), 1e9);

  logger.info(`funding user account ${user.address()}`);

  await initUserResources(
    client,
    user,
    dex.address(),
    dex.address(),
    baseTag,
    quoteTag
  );

  logger.info(`initialized user resources`);

  const userBalance = await getBalance(
    client,
    user.address(),
    "0x1::aptos_coin::AptosCoin"
  );

  logger.info(`user balance is now ${userBalance}`);

  logger.info("minting base tokens");
  const mintBaseTxn = await mintManagedCoin(
    client,
    dex,
    baseTag,
    user.address(),
    1e9
  );
  logTxnResult(mintBaseTxn);

  logger.info("minting quote tokens");
  const mintQuoteTxn = await mintManagedCoin(
    client,
    dex,
    quoteTag,
    user.address(),
    1e9
  );
  logTxnResult(mintQuoteTxn);

  const txn1 = await placeLimitOrder(
    client,
    user,
    dex.address(),
    dex.address(),
    baseTag,
    quoteTag,
    "buy",
    1 * 1e6,
    1 * 1e6,
    "gtc",
    false
  );
  logTxnResult(txn1);

  const txn2 = await placeLimitOrder(
    client,
    user,
    dex.address(),
    dex.address(),
    baseTag,
    quoteTag,
    "buy",
    2 * 1e6,
    1 * 1e6,
    "gtc",
    false
  );
  logTxnResult(txn2);

  const bids = await getBidsBookTop(
    client,
    dex.address(),
    baseTag,
    quoteTag,
    10
  );
  logger.info(bids);
}

main();

export {};
