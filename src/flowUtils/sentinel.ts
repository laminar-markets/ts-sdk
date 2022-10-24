export const U64_MAX_STR = "18446744073709551615";

export interface Sentinel {
  value: string;
}

export function sentinelToNumber(sentinel: Sentinel) {
  if (sentinel.value === U64_MAX_STR) {
    return null;
  } else {
    return parseInt(sentinel.value);
  }
}
