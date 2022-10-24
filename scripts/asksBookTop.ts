import { AptosAccount, AptosClient } from "aptos";
import { dexAddress, dexPrivateKey, nodeUrl } from "../src/constants";
import { getAsksBookTop } from "../src/book";

async function testGetAsksBookTop() {
  const client = new AptosClient(nodeUrl);
  const dex = new AptosAccount(dexPrivateKey, dexAddress);

  const baseTag = `${dexAddress}::coin::FakeBaseCoin`;
  const quoteTag = `${dexAddress}::coin::FakeQuoteCoin`;

  const asks = await getAsksBookTop(
    client,
    dex.address(),
    baseTag,
    quoteTag,
    10
  );
  console.log(asks);
}

testGetAsksBookTop();

export {};
