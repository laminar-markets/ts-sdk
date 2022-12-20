import { AptosAccount, AptosClient, FaucetClient, Types } from "aptos";
import {
  dexAddress,
  dexPrivateKey,
  faucetUrl,
  nodeUrl,
  userAddress,
  userPrivateKey,
} from "../tests/constants";
import { getBidsBookTop, placeLimitOrder, placeMarketOrder } from "../src/book";
import { logger } from "../tests/helpers";
import { getBalance } from "../src/coin";
import { Side, TimeInForce } from "../src";

const logTxnResult = (txn: Types.Transaction) => {
  if ("success" in txn && "vm_status" in txn) {
    logger.info(`success? ${txn.success}, status: ${txn.vm_status}`);
  } else {
    logger.info("transaction pending...");
  }
};

async function placeRandomOrder(
  client: AptosClient,
  user: AptosAccount,
  dex: AptosAccount,
  baseTag: string,
  quoteTag: string
) {
  const isLimit = Math.random() < 0.8;
  const side: Side = Math.random() < 0.5 ? "buy" : "sell";
  // const side: Side = "buy";

  // const size = Math.round(Math.random() * 100000) / 100;
  const size = Math.round(Math.random() * 9 + 1) * 100;

  let txn;
  if (isLimit) {
    // const price =
    //   Math.round(Math.random() * 100000) / 100 + (side === "buy" ? 0 : 500);
    const price =
      Math.round(Math.random() * 9 + 1) * 100 + (side === "buy" ? 0 : 500);
    const tifRand = Math.random();
    const tif: TimeInForce =
      tifRand < 0.8 ? "gtc" : tifRand < 0.9 ? "ioc" : "fok";
    // const tif: TimeInForce = "gtc";
    const postOnly =
      tif === "gtc" ? (Math.random() < 0.1 ? true : false) : false;

    logger.info(
      JSON.stringify({ orderType: "limit", side, price, size, tif, postOnly })
    );

    txn = await placeLimitOrder(
      client,
      user,
      dex.address(),
      dex.address(),
      baseTag,
      quoteTag,
      side,
      Math.round(price * 1e6),
      Math.round(size * 1e6),
      tif,
      postOnly
    );
  } else {
    logger.info(JSON.stringify({ orderType: "market", side, size }));

    txn = await placeMarketOrder(
      client,
      user,
      dex.address(),
      dex.address(),
      baseTag,
      quoteTag,
      side,
      Math.round(size * 1e6)
    );
  }
  logTxnResult(txn);
}

async function main() {
  const client = new AptosClient(nodeUrl);
  // const faucetClient = new FaucetClient(nodeUrl, faucetUrl);

  const dex = new AptosAccount(dexPrivateKey, dexAddress);

  const baseTag = `${dexAddress}::coin::FakeBaseCoin`;
  const quoteTag = `${dexAddress}::coin::FakeQuoteCoin`;

  const user = new AptosAccount(userPrivateKey, userAddress);
  // await faucetClient.fundAccount(user.address(), 1e8);

  // const userBalance = await getBalance(
  //   client,
  //   user.address(),
  //   "0x1::aptos_coin::AptosCoin"
  // );

  // logger.info(`user balance is now ${userBalance}`);

  setInterval(() => {
    placeRandomOrder(client, user, dex, baseTag, quoteTag);
  }, 10000);
}

main();

export {};
