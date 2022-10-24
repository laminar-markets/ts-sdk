import { Side, TimeInForce } from "../../types/global";

export const randomSide = (): Side => (Math.random() < 0.5 ? "buy" : "sell");

export const randomTimeInForce = (): TimeInForce => {
  const rand = Math.random();
  if (rand < 0.33) {
    return "fok";
  } else if (rand < 0.66) {
    return "ioc";
  } else {
    return "gtc";
  }
};

export const randomNumber = (min: number, max: number, tick: number): number =>
  Math.floor((Math.random() * (max - min + 1) + min) / tick) * tick;
