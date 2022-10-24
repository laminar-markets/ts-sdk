import envSchema from "env-schema";
import addFormats from "ajv-formats";

type Env = {
  NODE_URL: string;
  FAUCET_URL: string;
  DEX_ADDRESS: string;
  DEX_PRIVATE_KEY: string;
};

const schema = {
  type: "object",
  required: ["NODE_URL", "FAUCET_URL", "DEX_ADDRESS", "DEX_PRIVATE_KEY"],
  properties: {
    NODE_URL: {
      type: "string",
      format: "uri",
    },
    FAUCET_URL: {
      type: "string",
      format: "uri",
    },
    DEX_ADDRESS: {
      type: "string",
      format: "hexString",
    },
    DEX_PRIVATE_KEY: {
      type: "string",
      format: "hexString",
    },
  },
};

const config = envSchema<Env>({
  schema: schema,
  dotenv: true,
  ajv: {
    customOptions(ajv) {
      addFormats(ajv);
      ajv.addFormat("hexString", /^(0x)?[0-9a-f]+$/);
      return ajv;
    },
  },
});

export const nodeUrl = config.NODE_URL;
export const faucetUrl = config.FAUCET_URL;

export const dexAddress = config.DEX_ADDRESS.startsWith("0x")
  ? config.DEX_ADDRESS
  : `0x${config.DEX_ADDRESS}`;

export const dexPrivateKey = Uint8Array.from(
  Buffer.from(
    config.DEX_PRIVATE_KEY.startsWith("0x")
      ? config.DEX_PRIVATE_KEY.substring(2)
      : config.DEX_PRIVATE_KEY,
    "hex"
  )
);

export const defaultOptions = {
  max_gas_amount: "10000",
  gas_unit_price: "100",
};
