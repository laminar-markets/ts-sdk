declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_URL: string;
    FAUCET_URL: string;
    DEX_ADDR: string;
    DEX_PUBLIC_KEY: string;
    DEX_PRIVATE_KEY: string;
  }
}
