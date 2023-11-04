// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CacheValue = Record<string, any> | number | string | boolean;

export interface CacheClient {
  get<T>(key: string): Promise<T | null>;
  set(
    key: string,
    value: CacheValue,
    options?: {
      expirationInMs?: number;
    },
  ): Promise<void>;
  isConnected(): boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}
