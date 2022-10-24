/**
 * Order side.
 */
export type Side = "buy" | "sell";

/**
 * Time-in-force value. Available options are good-'til-cancelled (GTC), immediate-or-cancel (IOC), and fill-or-kill (FOK).
 */
export type TimeInForce = "gtc" | "ioc" | "fok";

/**
 * Represents an orderbook level.
 */
export type BookLevel = {
  /**
   * The price of the order book level in quote currency units.
   */
  price: number;
  /**
   * The total size of the orders at the given price in base currency units.
   */
  size: number;
};

/**
 * GUID for an event.
 */
declare type EventGuid = {
  creation_number: string;
  account_address: string;
};

/**
 * An event from a transaction
 */
declare type Event = {
  key: string;
  guid: EventGuid;
  sequence_number: string;
  type: string;
  /**
   * The JSON representation of the event
   */
  data: any;
};
