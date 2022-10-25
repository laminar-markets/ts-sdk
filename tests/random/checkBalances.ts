import { AptosAccount, AptosClient, FaucetClient } from "aptos";
import * as fs from "fs/promises";
import { placeLimitOrder } from "../../src";
import { getBalance } from "../../src/coin";
import {
  dexAddress,
  dexPrivateKey,
  faucetUrl,
  nodeUrl,
} from "../../src/constants";
import { mintManagedCoin } from "../../src/managedCoin";
import { sideToU8 } from "../../src/util";
import { Side, TimeInForce } from "../../types/global";
import { initDexResources, initUserResources, logger } from "../helpers";
import { randomNumber, randomSide } from "./randUtils";

type OrderRecord = {
  orderId: number;
  side: Side;
  price: number;
  size: number;
  timeInForce: TimeInForce;
};

const baseTag = `${dexAddress}::coin::FakeBaseCoin`;
const quoteTag = `${dexAddress}::coin::FakeQuoteCoin`;

const main = async () => {
  const client = new AptosClient(nodeUrl);
  const faucetClient = new FaucetClient(nodeUrl, faucetUrl);

  const dex = new AptosAccount(dexPrivateKey, dexAddress);
  const user = new AptosAccount();

  await faucetClient.fundAccount(user.address(), 1e12);

  await initDexResources(client, dex, dex, baseTag, quoteTag);
  await initUserResources(
    client,
    user,
    dex.address(),
    dex.address(),
    baseTag,
    quoteTag
  );

  await mintManagedCoin(client, dex, baseTag, user.address(), 1e16);
  await mintManagedCoin(client, dex, quoteTag, user.address(), 1e16);

  const hst: Array<OrderRecord> = [];

  let expectedQuoteBalance = 1e16;

  // place random bids and monitor quote currency balance
  try {
    for (let i = 0; i < 10; i++) {
      const side = "buy";
      const price = 1_000_000;
      const size = randomNumber(1_000_000, 10_000_000, 100_000);

      hst.push({
        orderId: i,
        side,
        price,
        size,
        timeInForce: "gtc",
      });

      const txn = await placeLimitOrder(
        client,
        user,
        dex.address(),
        baseTag,
        quoteTag,
        side,
        price,
        size,
        "gtc",
        false
      );

      expectedQuoteBalance -= size;
      const quoteBalance = await getBalance(client, user.address(), quoteTag);

      if ("success" in txn) {
        if (quoteBalance === expectedQuoteBalance) {
          logger.info(
            JSON.stringify({
              quoteBalance,
              expected: expectedQuoteBalance,
            })
          );
        } else {
          logger.error(
            JSON.stringify({
              quoteBalance,
              expected: expectedQuoteBalance,
            })
          );
          const ts = Date.now();
          for (const entry of hst) {
            await fs.appendFile(
              `orders-${ts}.txt`,
              `place_limit_order<FakeBaseCoin, FakeQuoteCoin>(user, dex_addr, ${sideToU8(
                entry.side
              )}, ${entry.price}, ${entry.size}, 0, false);\n`
            );
          }
          return;
        }
      } else {
        logger.info(`Transaction pending...`);
      }
    }

    let expectedBaseBalance = 1e16;

    // place random asks and monitor base currency balance
    for (let i = 0; i < 5; i++) {
      const side = "sell";
      const price = 1_000_000;
      const size = randomNumber(1_000_000, 10_000_000, 100_000);

      hst.push({
        orderId: i,
        side,
        price,
        size,
        timeInForce: "gtc",
      });

      const txn = await placeLimitOrder(
        client,
        user,
        dex.address(),
        baseTag,
        quoteTag,
        side,
        price,
        size,
        "gtc",
        false
      );

      expectedBaseBalance -= size;
      const baseBalance = await getBalance(client, user.address(), baseTag);

      if ("success" in txn) {
        if (baseBalance === expectedBaseBalance) {
          logger.info(
            JSON.stringify({
              baseBalance,
              expected: expectedBaseBalance,
            })
          );
        } else {
          logger.error(
            JSON.stringify({
              baseBalance,
              expected: expectedBaseBalance,
            })
          );
          // const ts = Date.now();
          // for (const entry of hst) {
          //   await fs.appendFile(
          //     `orders-${ts}.txt`,
          //     `place_limit_order<FakeBaseCoin, FakeQuoteCoin>(user, dex_addr, ${sideToU8(
          //       entry.side
          //     )}, ${entry.price}, ${entry.size}, 0, false);\n`
          //   );
          // }
          // return;
        }
      } else {
        logger.info(`Transaction pending...`);
      }
    }
  } catch (e) {
    logger.error(e);
    console.dir(hst, { depth: null });
  }
};

main().then(() => ({}));
