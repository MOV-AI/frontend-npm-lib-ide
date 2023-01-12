import Store from "./ConfigurationStore";
import Model from "../models/Configuration";
import { DBSubscriber } from "../../../store";

test("Smoke test", () => {
  const obj = new Store();

  expect(obj).toBeInstanceOf(Store);
});

test("Get plugin loaded", () => {
  const store = new Store();

  expect(store.getPlugin("DBSubscriber")).toBeInstanceOf(DBSubscriber);
});

test("Validate defaults", () => {
  const store = new Store();

  expect(store.workspace).toBe("global");
  expect(store.name).toBe("Configuration");
  expect(store.title).toBe("Configurations");
  expect(store.model).toBe(Model);
});
