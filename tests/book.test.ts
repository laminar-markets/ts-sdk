import { AptosAccount, AptosClient, FaucetClient } from "aptos";

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

describe("book", () => {
  let dex: AptosAccount;
  let user: AptosAccount;

  let client: AptosClient;
  let faucetClient: FaucetClient;

  beforeAll(async () => {
    client = new AptosClient(nodeUrl);
    faucetClient = new FaucetClient(nodeUrl, faucetUrl);

    dex = new AptosAccount(dexPrivateKey, dexAddress);
    user = new AptosAccount();

    await faucetClient.fundAccount(user.address(), 5e6);

    await initDexResources(client, dex, dex, baseTag, quoteTag);
    await initUserResources(
      client,
      user,
      dex.address(),
      dex.address(),
      baseTag,
      quoteTag
    );
  });

  test("mint base coins", async () => {
    const mintBaseTxn = await mintManagedCoin(
      client,
      dex,
      baseTag,
      user.address(),
      10000
    );
    expect("success" in mintBaseTxn && mintBaseTxn.success).toBe(true);
  });

  test("mint quote coins", async () => {
    const mintQuoteTxn = await mintManagedCoin(
      client,
      dex,
      quoteTag,
      user.address(),
      10000
    );
    expect("success" in mintQuoteTxn && mintQuoteTxn.success).toBe(true);
  });
});
