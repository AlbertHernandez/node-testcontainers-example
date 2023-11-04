import { createClient } from "redis";

import { CacheClient, CacheValue } from "./cache-client";

export class RedisCacheClient implements CacheClient {
  private readonly _client;

  constructor(dependencies: { url: string }) {
    this._client = createClient({
      url: dependencies.url,
    });

    this._client.on("error", this.handleClientError.bind(this));
  }

  private handleClientError(error: unknown) {
    if (error instanceof Error) {
      console.log("Error: ", error.message);
      return;
    }

    console.error("Unknown error: ", error);
  }

  async connect(): Promise<void> {
    await this._client.connect();
  }

  async disconnect(): Promise<void> {
    await this._client.disconnect();
  }

  isConnected(): boolean {
    return this._client.isReady;
  }

  private async getConnectedClient() {
    if (this.isConnected()) {
      return this._client;
    }

    await this.connect();
    return this._client;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const client = await this.getConnectedClient();
      const storedValue = await client.get(key);

      if (!storedValue) {
        return null;
      }

      return this.transformValueFromStorageFormat(storedValue) as T;
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }
      this.handleClientError(error);
      return null;
    }
  }

  async set(
    key: string,
    value: CacheValue,
    options?: { expirationInMs?: number },
  ): Promise<void> {
    try {
      const client = await this.getConnectedClient();
      const stringifyValue =
        typeof value === "string"
          ? value
          : this.stringifyValueForStoring(value);
      await client.set(key, stringifyValue, {
        PX: options?.expirationInMs,
      });
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      this.handleClientError(error);
    }
  }

  private stringifyValueForStoring(value: CacheValue): string {
    return JSON.stringify(value);
  }

  private transformValueFromStorageFormat(value: string): CacheValue {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  }
}
