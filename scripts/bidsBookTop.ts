import { AptosAccount, AptosClient } from "aptos";
import { dexAddress, dexPrivateKey, nodeUrl } from "../tests/constants";
import { getBidsBookTop } from "../src/book";

async function testGetBidsBookTop() {
  const client = new AptosClient(nodeUrl);
  const dex = new AptosAccount(dexPrivateKey, dexAddress);

  const baseTag = `${dexAddress}::coin::FakeBaseCoin`;
  const quoteTag = `${dexAddress}::coin::FakeQuoteCoin`;

  const bids = await getBidsBookTop(
    client,
    dex.address(),
    baseTag,
    quoteTag,
    10
  );
  console.log(bids);
}

testGetBidsBookTop();

export {};
