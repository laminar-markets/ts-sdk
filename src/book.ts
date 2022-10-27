import { AptosAccount, AptosClient, HexString, Types } from "aptos";

import { BookLevel, Side, TimeInForce } from "../types/global";
import { SplayTree, UnparsedTree } from "./flowUtils/splayTree";
import { Iterator } from "./flowUtils/iterator";
import { Order } from "./flowUtils";
import { sideToU8, signSubmitAndWaitFor, timeInForceToU8 } from "./util";
import { dexAddress, defaultOptions } from "./constants";
import { Queue, UnparsedQueue } from "./flowUtils/queue";

declare type EntryFunctionPayload = {
  function: string;
  type_arguments: Array<string>;
  arguments: Array<any>;
};

export function createOrderbookPayload(
  baseTag: string,
  quoteTag: string,
  priceDecimals: number,
  sizeDecimals: number,
  minSizeAmount: number
): EntryFunctionPayload {
  return {
    function: `${dexAddress}::book::create_orderbook`,
    type_arguments: [baseTag, quoteTag],
    arguments: [priceDecimals, sizeDecimals, minSizeAmount],
  };
}

/**
 * Creates a new orderbook for the given base/quote pair.
 *
 * @remarks
 * Any user can create an orderbook using this module.
 *
 * @param client - The Aptos client.
 * @param account - The account that will own the orderbook.
 * @param baseTag - The tag for the base currency of the orderbook, e.g. 0x1::aptos_coin::AptosCoin.
 * @param quoteTag - The tag for the quote currency of the orderbook.
 * @param priceDecimals - The number of decimals places the orderbook will allow for price.
 * @param sizeDecimals - The number of decimals places the orderbook will allow for price.
 * @param minSizeAmount - The minimum size an order must be to be placed on the orderbook.
 *
 * @returns - A promise containing the transaction.
 *
 * @example Creating an Aptos/Aptos orderbook.
 *
 * ```ts
 * const txn = await createOrderbook(
 *   client,
 *   account,
 *   "0x1::aptos_coin::AptosCoin",
 *   "0x1::aptos_coin::AptosCoin",
 *   4,
 *   4,
 *   10000
 * );
 * ```
 *
 * - Note that AptosCoin has 8 decimals points, so the sum of `priceDecimals` and `sizeDecimals`
 * must be greater than or equal to 8. Otherwise, this transaction will fail.
 * - `minSizeAmount` can be set to any value, but note that in this example, if it is
 * set to a value less than `10^4`, any order below `10^4` will be rejected due to
 * the `sizeDecimals` check.
 *
 */
export async function createOrderbook(
  client: AptosClient,
  account: AptosAccount,
  baseTag: string,
  quoteTag: string,
  priceDecimals: number,
  sizeDecimals: number,
  minSizeAmount: number
): Promise<Types.Transaction> {
  const payload = createOrderbookPayload(
    baseTag,
    quoteTag,
    priceDecimals,
    sizeDecimals,
    minSizeAmount
  );
  const rawTxn = await client.generateTransaction(account.address(), payload);
  return await signSubmitAndWaitFor(client, account, rawTxn);
}

export function registerUserPayload(): EntryFunctionPayload {
  return {
    function: `${dexAddress}::book::register_user`,
    type_arguments: [],
    arguments: [],
  };
}

/**
 * Register a user for Laminar.
 *
 * @remarks
 * This must be run before the user is able to place orders on the dex.
 *
 * @param client - The Aptos client.
 * @param account - The account to register for the orderbook.
 *
 * @returns - A promise containing the transaction.
 *
 * @example Registering an account to an Aptos/Aptos orderbook published on address `0xb`.
 *
 * ```ts
 * const txn = await registerBookUser(
 *   client,
 *   account,
 * );
 * ```
 */
export async function registerUser(
  client: AptosClient,
  account: AptosAccount
): Promise<Types.Transaction> {
  const payload = registerUserPayload();
  const rawTxn = await client.generateTransaction(
    account.address(),
    payload,
    defaultOptions
  );
  return await signSubmitAndWaitFor(client, account, rawTxn);
}

export function placeLimitOrderPayload(
  bookOwner: HexString,
  baseTag: string,
  quoteTag: string,
  side: Side,
  price: number,
  size: number,
  timeInForce: TimeInForce,
  postOnly: boolean
): EntryFunctionPayload {
  return {
    function: `${dexAddress}::book::place_limit_order`,
    type_arguments: [baseTag, quoteTag],
    arguments: [
      bookOwner,
      sideToU8(side),
      price,
      size,
      timeInForceToU8(timeInForce),
      postOnly,
    ],
  };
}

/**
 * Place a limit order.
 *
 * @remarks {@link registerUser} must be executed before placing an order.
 *
 * @param client - The Aptos client.
 * @param account - The account placing the order.
 * @param bookOwner - The address of the orderbook owner.
 * @param baseTag - The tag for the base currency of the orderbook.
 * @param quoteTag - The tag for the quote currency of the orderbook.
 * @param side - Order side.
 * @param price - Order price, in quote currency units.
 * @param size - Order size, in base currency units.
 * @param timeInForce - Good-'til-cancelled, immediate-or-cancel, or fill-or-kill.
 * @param postOnly - If set to true, order will be rejected if it will immediately be filled.
 *
 * @returns - A promise containing the transaction.
 *
 * @example Place a limit order to buy 4 Aptos for price 1 on an Aptos/Aptos orderbook published at address `0xb`.
 *
 * ```ts
 * const txn = await placeLimitOrder(
 *   client,
 *   account,
 *   "0xb",
 *   "0x1::aptos_coin::AptosCoin",
 *   "0x1::aptos_coin::AptosCoin",
 *   "buy",
 *   100_000_000,
 *   400_000_000,
 *   "gtc",
 *   false
 * );
 * ```
 *
 * - Price is denoted in quote coin units, which in this case is Aptos coin. Thus,
 *   a price of 1is expressed as 100,000,000.
 * - Size is denoted in base coin units, which is Aptos coin in this example. Thus,
 *   an order size of 4 is denoted as 400,000,000.
 */
export async function placeLimitOrder(
  client: AptosClient,
  account: AptosAccount,
  bookOwner: HexString,
  baseTag: string,
  quoteTag: string,
  side: Side,
  price: number,
  size: number,
  timeInForce: TimeInForce,
  postOnly: boolean
): Promise<Types.Transaction> {
  const payload = placeLimitOrderPayload(
    bookOwner,
    baseTag,
    quoteTag,
    side,
    price,
    size,
    timeInForce,
    postOnly
  );
  const rawTxn = await client.generateTransaction(
    account.address(),
    payload,
    defaultOptions
  );
  return await signSubmitAndWaitFor(client, account, rawTxn);
}

export function placeMarketOrderPayload(
  bookOwner: HexString,
  baseTag: string,
  quoteTag: string,
  side: Side,
  size: number
): EntryFunctionPayload {
  return {
    function: `${dexAddress}::book::place_market_order`,
    type_arguments: [baseTag, quoteTag],
    arguments: [bookOwner, sideToU8(side), size],
  };
}

/**
 * Place a market order.
 *
 * @remarks {@link registerUser} must be executed before placing an order.
 *
 * @param client - The Aptos client.
 * @param account - The account placing the order.
 * @param bookOwner - The address of the orderbook owner.
 * @param baseTag - The tag for the base currency of the orderbook.
 * @param quoteTag - The tag for the quote currency of the orderbook.
 * @param side - Order side.
 * @param size - Order size, in base currency units.
 *
 * @returns - A promise containing the transaction.
 *
 * @example Place a market order to buy 4 Aptos on an Aptos/Aptos orderbook published at address `0xb`.
 *
 * ```ts
 * const txn = await placeMarketOrder(
 *   client,
 *   account,
 *   "0xb",
 *   "0x1::aptos_coin::AptosCoin",
 *   "0x1::aptos_coin::AptosCoin",
 *   "buy",
 *   400_000_000,
 * );
 * ```
 *
 * - Size is denoted in base coin units, which is Aptos coin in this example. Thus,
 *   an order size of 4 is denoted as 400,000,000.
 */
export async function placeMarketOrder(
  client: AptosClient,
  account: AptosAccount,
  bookOwner: HexString,
  baseTag: string,
  quoteTag: string,
  side: Side,
  size: number
): Promise<Types.Transaction> {
  const payload = placeMarketOrderPayload(
    bookOwner,
    baseTag,
    quoteTag,
    side,
    size
  );
  const rawTxn = await client.generateTransaction(
    account.address(),
    payload,
    defaultOptions
  );
  return await signSubmitAndWaitFor(client, account, rawTxn);
}

export function cancelOrderPayload(
  bookOwner: HexString,
  baseTag: string,
  quoteTag: string,
  idCreationNum: number,
  side: Side
): EntryFunctionPayload {
  return {
    function: `${dexAddress}::book::cancel_order`,
    type_arguments: [baseTag, quoteTag],
    arguments: [bookOwner, idCreationNum, sideToU8(side)],
  };
}

/**
 * Cancel an order.
 *
 * @param client - The Aptos client.
 * @param account - The account placing the order.
 * @param bookOwner - The address of the orderbook owner.
 * @param baseTag - The tag for the base currency of the orderbook.
 * @param quoteTag - The tag for the quote currency of the orderbook.
 * @param idCreationNum - ID creation number for the order to be cancelled.
 * @param side - Order side.
 *
 * @returns - A promise containing the transaction.
 *
 * @example Cancel a bid order created with `idCreationNum` 1 on an Aptos/Aptos orderbook published at address `0xb`.
 *
 * ```ts
 * const txn = await placeMarketOrder(
 *   client,
 *   account,
 *   "0xb",
 *   "0x1::aptos_coin::AptosCoin",
 *   "0x1::aptos_coin::AptosCoin",
 *   1,
 *   "buy",
 * );
 * ```
 */
export async function cancelOrder(
  client: AptosClient,
  account: AptosAccount,
  bookOwner: HexString,
  baseTag: string,
  quoteTag: string,
  idCreationNum: number,
  side: Side
): Promise<Types.Transaction> {
  const payload = cancelOrderPayload(
    bookOwner,
    baseTag,
    quoteTag,
    idCreationNum,
    side
  );
  const rawTxn = await client.generateTransaction(
    account.address(),
    payload,
    defaultOptions
  );
  return await signSubmitAndWaitFor(client, account, rawTxn);
}

export function amendOrderPayload(
  bookOwner: HexString,
  baseTag: string,
  quoteTag: string,
  idCreationNum: number,
  side: Side,
  price: number,
  size: number
): EntryFunctionPayload {
  return {
    function: `${dexAddress}::book::amend_order`,
    type_arguments: [baseTag, quoteTag],
    arguments: [bookOwner, idCreationNum, sideToU8(side), price, size],
  };
}

/**
 * Amend an order.
 *
 * @remarks
 * Queue priority will only preserved if the order size is reduced and the order price remains unchanged.
 * Otherwise, the amended order will be placed at the back of the queue.
 *
 * @param client - The Aptos client.
 * @param account - The account placing the order.
 * @param bookOwner - The address of the orderbook owner.
 * @param baseTag - The tag for the base currency of the orderbook.
 * @param quoteTag - The tag for the quote currency of the orderbook.
 * @param idCreationNum - ID creation number for the order to be cancelled.
 * @param side - Order side.
 * @param price - Order price, in quote currency units.
 * @param size - Order size, in base currency units.
 *
 * @returns - A promise containing the transaction.
 *
 * @example Amend a bid order created with `idCreationNum` 1 on an Aptos/Aptos orderbook published at address `0xb`.
 *
 * ```ts
 * const txn = await placeMarketOrder(
 *   client,
 *   account,
 *   "0xb",
 *   "0x1::aptos_coin::AptosCoin",
 *   "0x1::aptos_coin::AptosCoin",
 *   1,
 *   "buy",
 *   100_000_000,
 *   200_000_000
 * );
 * ```
 *
 * - Price is denoted in quote coin units, which in this case is Aptos coin. Thus,
 *   a price of 1 is expressed as 100,000,000.
 * - Size is denoted in base coin units, which is Aptos coin in this example. Thus,
 *   an order size of 2 is denoted as 200,000,000.
 * - If the amended size falls below the remaining unfilled size of the order,
 *   the order is cancelled.
 */
export async function amendOrder(
  client: AptosClient,
  account: AptosAccount,
  bookOwner: HexString,
  baseTag: string,
  quoteTag: string,
  idCreationNum: number,
  side: Side,
  price: number,
  size: number
): Promise<Types.Transaction> {
  const payload = amendOrderPayload(
    bookOwner,
    baseTag,
    quoteTag,
    idCreationNum,
    side,
    price,
    size
  );
  const rawTxn = await client.generateTransaction(
    account.address(),
    payload,
    defaultOptions
  );
  return await signSubmitAndWaitFor(client, account, rawTxn);
}

/**
 * Get the top of the bids orderbook.
 *
 * @param client - The Aptos client.
 * @param bookOwner - The address of the orderbook owner.
 * @param baseTag - The tag for the base currency of the orderbook.
 * @param quoteTag - The tag for the quote currency of the orderbook.
 * @param numLevels - The number of levels to retrieve.
 *
 * @returns - An array containing the top `numLevels` levels of the bids orderbook.
 *
 * @example Get the top 10 levels for bids on an Aptos/Aptos orderbook published at address `0xb`.
 *
 * ```ts
 * const lvls = await getBidsBookTop(
 *   client,
 *   "0xb",
 *   "0x1::aptos_coin::AptosCoin",
 *   "0x1::aptos_coin::AptosCoin",
 *   10,
 * );
 * ```
 */
export async function getBidsBookTop(
  client: AptosClient,
  bookOwner: HexString,
  baseTag: string,
  quoteTag: string,
  numLevels: number
): Promise<Array<BookLevel>> {
  const bidsBookTag = `${bookOwner.toString()}::book::OrderBookBids<${baseTag}, ${quoteTag}>`;
  const bidsBook: any = await client.getAccountResource(bookOwner, bidsBookTag);

  const bids: UnparsedTree<UnparsedQueue<Order>> = bidsBook.data.bids;
  const parsedBids = new SplayTree(bids);
  const iter = new Iterator(parsedBids, true);

  const bookLevels: Array<BookLevel> = [];

  let i = 0;
  while (i < numLevels && !iter.isDone) {
    const lvl = iter.next();
    const size = new Queue(lvl.value).values.reduce(
      (t: number, o: Order) => t + parseInt(o.remaining_size),
      0
    );
    bookLevels.push({
      price: lvl.key,
      size,
    });
    i++;
  }
  return bookLevels;
}

/**
 * Get the top of the asks orderbook.
 *
 * @param client - The Aptos client.
 * @param bookOwner - The address of the orderbook owner.
 * @param baseTag - The tag for the base currency of the orderbook.
 * @param quoteTag - The tag for the quote currency of the orderbook.
 * @param numLevels - The number of levels to retrieve.
 *
 * @returns - An array containing the top `numLevels` levels of the asks orderbook.
 *
 * @example Get the top 10 levels for asks on an Aptos/Aptos orderbook published at address `0xb`.
 *
 * ```ts
 * const lvls = await getAsksBookTop(
 *   client,
 *   "0xb",
 *   "0x1::aptos_coin::AptosCoin",
 *   "0x1::aptos_coin::AptosCoin",
 *   10,
 * );
 * ```
 */
export async function getAsksBookTop(
  client: AptosClient,
  bookOwner: HexString,
  baseTag: string,
  quoteTag: string,
  numLevels: number
): Promise<Array<BookLevel>> {
  const asksBookTag = `${bookOwner.toString()}::book::OrderBookAsks<${baseTag}, ${quoteTag}>`;
  const asksBook: any = await client.getAccountResource(bookOwner, asksBookTag);

  const asks: UnparsedTree<UnparsedQueue<Order>> = asksBook.data.asks;
  const parsedAsks = new SplayTree<UnparsedQueue<Order>>(asks);
  const iter = new Iterator(parsedAsks, false);

  const bookLevels: Array<BookLevel> = [];

  let i = 0;
  while (i < numLevels && !iter.isDone) {
    const lvl = iter.next();
    const size = new Queue(lvl.value).values.reduce(
      (t: number, o: Order) => t + parseInt(o.remaining_size),
      0
    );
    bookLevels.push({
      price: lvl.key,
      size,
    });
    i++;
  }
  return bookLevels;
}
