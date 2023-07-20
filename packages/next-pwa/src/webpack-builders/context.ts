import { convertBoolean } from "../utils.js";

const resolveContextEnv = <T>(
  env: string | undefined,
  transform?: (_: string) => T
) => {
  if (env) {
    return transform?.(env);
  }
  return undefined;
};

export const NextPWAContext = {
  shouldMinify: resolveContextEnv(process.env.NEXT_PWA_MINIFY, convertBoolean),
  useSwcMinify: resolveContextEnv(
    process.env.NEXT_PWA_SWC_MINIFY,
    convertBoolean
  ),
};

/**
 * Set default value for a key in `NextPWAContext`.
 * @param key The key in `NextPWAContext`
 * @param value The value
 */
export const setDefaultContext = <T extends keyof typeof NextPWAContext>(
  key: T,
  value: (typeof NextPWAContext)[T]
) => {
  if (NextPWAContext[key] === undefined) {
    NextPWAContext[key] = value;
  }
};
