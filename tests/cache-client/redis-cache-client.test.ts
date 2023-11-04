import { RedisCacheClient } from "../../src/cache-client/redis-cache-client";
import { config } from "../../src/config";

describe("RedisCacheClient", () => {
  let redisCacheClient: RedisCacheClient;

  beforeAll(async () => {
    redisCacheClient = new RedisCacheClient({
      url: config.redis.url,
    });
    await redisCacheClient.connect();
  });

  afterAll(async () => {
    await redisCacheClient.disconnect();
  });

  it("should indicate is connected after connecting", async () => {
    const isConnected = redisCacheClient.isConnected();
    expect(isConnected).toBeTruthy();
  });

  it("should return null when the key does not exist", async () => {
    const value = await redisCacheClient.get("non-existing-key");
    expect(value).toBeNull();
  });

  it("should return the string value when was created previously", async () => {
    const key = "key-string";
    const value = "value";
    await redisCacheClient.set(key, value);
    const cachedValue = await redisCacheClient.get(key);
    expect(cachedValue).toBe(value);
  });

  it("should return the object value when was created previously", async () => {
    const key = "key-object";
    const value = {
      name: "value",
    };
    await redisCacheClient.set(key, value);
    const cachedValue = await redisCacheClient.get(key);
    expect(cachedValue).toEqual(value);
  });
});
