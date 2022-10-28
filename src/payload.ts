import { HexString, Types } from "aptos";
import { Side, TimeInForce } from "../types/global";
import { sideToU8, timeInForceToU8 } from "./util";

export function createOrderbookPayload(
  dexAddress: string,
  baseTag: string,
  quoteTag: string,
  priceDecimals: number,
  sizeDecimals: number,
  minSizeAmount: number
): Types.EntryFunctionPayload {
  return {
    function: `${dexAddress}::book::create_orderbook`,
    type_arguments: [baseTag, quoteTag],
    arguments: [priceDecimals, sizeDecimals, minSizeAmount],
  };
}

export function registerUserPayload(
  dexAddress: string
): Types.EntryFunctionPayload {
  return {
    function: `${dexAddress}::book::register_user`,
    type_arguments: [],
    arguments: [],
  };
}

export function placeLimitOrderPayload(
  dexAddress: string,
  bookOwner: HexString,
  baseTag: string,
  quoteTag: string,
  side: Side,
  price: number,
  size: number,
  timeInForce: TimeInForce,
  postOnly: boolean
): Types.EntryFunctionPayload {
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

export function placeMarketOrderPayload(
  dexAddress: string,
  bookOwner: HexString,
  baseTag: string,
  quoteTag: string,
  side: Side,
  size: number
): Types.EntryFunctionPayload {
  return {
    function: `${dexAddress}::book::place_market_order`,
    type_arguments: [baseTag, quoteTag],
    arguments: [bookOwner, sideToU8(side), size],
  };
}

export function cancelOrderPayload(
  dexAddress: string,
  bookOwner: HexString,
  baseTag: string,
  quoteTag: string,
  idCreationNum: number,
  side: Side
): Types.EntryFunctionPayload {
  return {
    function: `${dexAddress}::book::cancel_order`,
    type_arguments: [baseTag, quoteTag],
    arguments: [bookOwner, idCreationNum, sideToU8(side)],
  };
}

export function amendOrderPayload(
  dexAddress: string,
  bookOwner: HexString,
  baseTag: string,
  quoteTag: string,
  idCreationNum: number,
  side: Side,
  price: number,
  size: number
): Types.EntryFunctionPayload {
  return {
    function: `${dexAddress}::book::amend_order`,
    type_arguments: [baseTag, quoteTag],
    arguments: [bookOwner, idCreationNum, sideToU8(side), price, size],
  };
}
