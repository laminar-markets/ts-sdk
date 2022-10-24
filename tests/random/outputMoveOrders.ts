import { AptosAccount, AptosClient, FaucetClient } from "aptos";
import * as fs from "fs/promises";
import { placeLimitOrder } from "../../src";
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

  try {
    for (let i = 0; i < 500; i++) {
      const side = randomSide();
      const price = 1_000;
      // const price =
      //   side === "buy"
      //     ? randomNumber(1_000_000, 10_000_000, 1_000_000)
      //     : randomNumber(5_000_000, 15_000_000, 1_000_000);
      const size = randomNumber(1_000, 10_000, 1_000);

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

      if ("success" in txn) {
        if (txn.success && "gas_used" in txn) {
          logger.info(
            JSON.stringify({
              orderId: i,
              side,
              price,
              size,
              timeInForce: "gtc",
              success: true,
              gasUsed: txn.gas_used,
            })
          );
        } else {
          logger.error(
            JSON.stringify({
              orderId: i,
              side,
              price,
              size,
              timeInForce: "gtc",
              success: false,
              gasUsed: txn.gas_used,
              status: txn.vm_status,
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
  } catch (e) {
    logger.error(e);
    console.dir(hst, { depth: null });
  }
};

main().then(() => ({}));
