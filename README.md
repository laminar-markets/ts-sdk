# Laminar Markets TypeScript SDK

[![Node.js CI](https://github.com/laminar-markets/ts-sdk/actions/workflows/nodejs.yml/badge.svg)](https://github.com/laminar-markets/ts-sdk/actions/workflows/nodejs.yml)

TypeScript SDK for [Laminar Markets](https://laminar.markets/).

## Installation

Using npm

```sh
npm install @laminar-markets/sdk
```

Using yarn

```sh
yarn add @laminar-markets/sdk
```

Using pnpm

```sh
pnpm install @laminar-markets/sdk
```

## Documentation

The Laminar Markets TypeScript SDK docs are available at <https://ts-sdk-docs.laminar.markets/>.

## Example

Registering a user and placing a market order:

```ts
import { registerUser, placeLimitOrder } from "@laminar-markets/sdk";
import { AptosAccount, AptosClient, HexString } from "aptos";

const NODE_URL = "<YOUR_NODE_URL>";

// dex address must be of type HexString. use HexString.ensure
// to convert from string to HexString.
const DEX_ADDRESS = HexString.ensure("<YOUR_DEX_ADDRESS>");

// tags should be in the format <ADDRESS>::<MODULE_NAME>::<TYPE_NAME>
// e.g. 0x1::aptos_coin::AptosCoin
const BASE_TAG = "<YOUR_BASE_COIN_TAG>";
const QUOTE_TAG = "<YOUR_QUOTE_COIN_TAG>";

async function main() {
  const client = new AptosClient(NODE_URL);
  const user = new AptosAccount();

  await registerUser(client, user);

  const txn = await placeLimitOrder(
    client,
    user,
    DEX_ADDRESS,
    BASE_TAG,
    QUOTE_TAG,
    "buy",
    1_000_000,
    1_000_000,
    "gtc",
    false
  );
  console.log(txn);
}

main();
```

Retrieving the top of the bids orderbook for a given pair of coins:

```ts
import { getBidsBookTop } from "@laminar-markets/sdk";
import { AptosClient, HexString } from "aptos";

const NODE_URL = "<YOUR_NODE_URL>";
const DEX_ADDRESS = HexString.ensure("<YOUR_DEX_ADDRESS>");

const BASE_TAG = "<YOUR_BASE_COIN_TAG>";
const QUOTE_TAG = "<YOUR_QUOTE_COIN_TAG>";

async function main() {
  const client = new AptosClient(NODE_URL);

  const lvls = await getBidsBookTop(
    client,
    DEX_ADDRESS,
    BASE_TAG,
    QUOTE_TAG,
    10
  );

  for (const lvl of lvls) {
    console.log(`price: ${lvl.price}, size: ${lvl.size}`);
  }
}

main();
```

Please refer to the documentation to see details and usage examples on how to place market orders, amend and cancel orders, etc.
