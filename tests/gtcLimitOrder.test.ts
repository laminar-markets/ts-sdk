import { AptosAccount, AptosClient, FaucetClient } from "aptos";

import { placeLimitOrder } from "../src/book";
import { getBalance } from "../src/coin";
import {
  dexAddress,
  dexPrivateKey,
  faucetUrl,
  nodeUrl,
} from "../tests/constants";
import { mintManagedCoin } from "../src/managedCoin";
import { initDexResources, initUserResources } from "./helpers";

const baseTag = `${dexAddress}::coin::FakeBaseCoin`;
const quoteTag = `${dexAddress}::coin::FakeQuoteCoin`;

describe("gtc limit order", () => {
  let dex: AptosAccount;

  let client: AptosClient;
  let faucetClient: FaucetClient;

  beforeAll(async () => {
    client = new AptosClient(nodeUrl);
    faucetClient = new FaucetClient(nodeUrl, faucetUrl);

    dex = new AptosAccount(dexPrivateKey, dexAddress);

    await initDexResources(client, dex, dex, baseTag, quoteTag);
  });

  test("place limit bid order", async () => {
    const user = new AptosAccount();
    await faucetClient.fundAccount(user.address(), 1e9);
    await initUserResources(
      client,
      user,
      dex.address(),
      dex.address(),
      baseTag,
      quoteTag
    );

    await mintManagedCoin(client, dex, quoteTag, user.address(), 1_000_000);
    const txn = await placeLimitOrder(
      client,
      user,
      dex.address(),
      dex.address(),
      baseTag,
      quoteTag,
      "buy",
      1_000_000,
      1_000_000,
      "gtc",
      false
    );
    expect("success" in txn && txn.success).toBe(true);

    if (!("events" in txn)) {
      throw new Error("Transaction did not contain events field.");
    }

    const placeEvent = txn.events.find(
      ({ type }: { type: string }) =>
        type === `${dexAddress}::order::PlaceOrderEvent`
    );

    if (placeEvent == null) {
      throw new Error("PlaceOrderEvent not found in events.");
    }

    expect(placeEvent.data.side).toBe(0);

    const quoteBalance = await getBalance(client, user.address(), quoteTag);
    expect(quoteBalance).toBe(0);
  });

  test("place limit ask order", async () => {
    const user = new AptosAccount();
    await faucetClient.fundAccount(user.address(), 1e9);
    await initUserResources(
      client,
      user,
      dex.address(),
      dex.address(),
      baseTag,
      quoteTag
    );

    await mintManagedCoin(client, dex, baseTag, user.address(), 1_000_000);
    const txn = await placeLimitOrder(
      client,
      user,
      dex.address(),
      dex.address(),
      baseTag,
      quoteTag,
      "sell",
      1_000_000,
      1_000_000,
      "gtc",
      false
    );
    expect("success" in txn && txn.success).toBe(true);

    if (!("events" in txn)) {
      throw new Error("Transaction did not contain events field.");
    }

    const placeEvent = txn.events.find(
      ({ type }: { type: string }) =>
        type === `${dexAddress}::order::PlaceOrderEvent`
    );
    if (placeEvent == null) {
      throw new Error("PlaceOrderEvent not found in events.");
    }
    expect(placeEvent.data.side).toBe(1);

    const baseBalance = await getBalance(client, user.address(), baseTag);
    expect(baseBalance).toBe(0);
  });

  test("fully fillable limit bid order is filled", async () => {
    // TODO use new orderbook for this, as the old one may already have orders on it
    const askUser = new AptosAccount();
    await faucetClient.fundAccount(askUser.address(), 1e9);
    await initUserResources(
      client,
      askUser,
      dex.address(),
      dex.address(),
      baseTag,
      quoteTag
    );

    await mintManagedCoin(client, dex, baseTag, askUser.address(), 1_200_000);

    const askTxn = await placeLimitOrder(
      client,
      askUser,
      dex.address(),
      dex.address(),
      baseTag,
      quoteTag,
      "sell",
      1_000_000,
      1_000_000,
      "gtc",
      false
    );
    expect("success" in askTxn && askTxn.success).toBe(true);

    const bidUser = new AptosAccount();
    await faucetClient.fundAccount(bidUser.address(), 1e9);
    await initUserResources(
      client,
      bidUser,
      dex.address(),
      dex.address(),
      baseTag,
      quoteTag
    );

    await mintManagedCoin(client, dex, quoteTag, bidUser.address(), 1_000_000);

    const bidTxn = await placeLimitOrder(
      client,
      bidUser,
      dex.address(),
      dex.address(),
      baseTag,
      quoteTag,
      "buy",
      1_000_000,
      1_000_000,
      "gtc",
      false
    );
    expect("success" in bidTxn && bidTxn.success).toBe(true);

    // console.log(bidTxn.events);
    // const fillEvent = bidTxn.events.find(
    //   ({ type }: { type: string }) =>
    //     type === `${dexAddress}::order::FillOrderEvent`
    // );
    // console.dir(fillEvent);  `
    // expect(placeEvent.data.side).toBe(0);

    // const ar = await client.getAccountResources(askUser.address());

    // console.log(
    //   "askUser FakeBaseCoin balance:",
    //   (
    //     ar.find(
    //       ({ type }) =>
    //         type === `0x1::coin::CoinStore<${dexAddress}::coin::FakeBaseCoin>`
    //     )?.data as any
    //   ).coin.value
    // );

    // console.log(
    //   "askUser FakeQuoteCoin balance:",
    //   (
    //     ar.find(
    //       ({ type }) =>
    //         type === `0x1::coin::CoinStore<${dexAddress}::coin::FakeQuoteCoin>`
    //     )?.data as any
    //   ).coin.value
    // );

    // const br = await client.getAccountResources(bidUser.address());

    // console.log(
    //   "bidUser FakeBaseCoin balance:",
    //   (
    //     br.find(
    //       ({ type }) =>
    //         type === `0x1::coin::CoinStore<${dexAddress}::coin::FakeBaseCoin>`
    //     )?.data as any
    //   ).coin.value
    // );

    // console.log(
    //   "bidUser FakeQuoteCoin balance:",
    //   (
    //     br.find(
    //       ({ type }) =>
    //         type === `0x1::coin::CoinStore<${dexAddress}::coin::FakeQuoteCoin>`
    //     )?.data as any
    //   ).coin.value
    // );
  });
});
