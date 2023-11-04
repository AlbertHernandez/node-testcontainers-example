import { GenericContainer, StartedTestContainer } from "testcontainers";

import { RedisCacheClient } from "../../src/cache-client/redis-cache-client";

describe("RedisCacheClient", () => {
  let redisCacheClient: RedisCacheClient;
  let container: StartedTestContainer;

  beforeAll(async () => {
    const port = 6379;
    container = await new GenericContainer("redis")
      .withExposedPorts(port)
      .start();
    const redisUrl = `redis://${container.getHost()}:${container.getMappedPort(
      port,
    )}`;
    redisCacheClient = new RedisCacheClient({
      url: redisUrl,
    });
    await redisCacheClient.connect();
  });

  afterAll(async () => {
    await redisCacheClient.disconnect();
    await container.stop();
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
    const key = "keyObject";
    const value = {
      name: "value",
    };
    await redisCacheClient.set(key, value);
    const cachedValue = await redisCacheClient.get(key);
    expect(cachedValue).toEqual(value);
  });
});
