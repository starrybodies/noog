import { DEFAULT_SETTINGS, normalizeSettings } from "./settings.js";

export function settingsWriter(storage) {
  let queue = Promise.resolve();
  return (message) => {
    const task = queue.then(async () => {
      const current = normalizeSettings(
        (await storage.local.get("settings")).settings,
      );
      const patch = Object.fromEntries(
        Object.entries(message.patch ?? {}).filter(
          ([key]) =>
            Object.hasOwn(DEFAULT_SETTINGS, key) && key !== "allowedCreators",
        ),
      );
      const creators = new Set(current.allowedCreators);
      for (const creator of message.removeCreators ?? [])
        if (typeof creator === "string") creators.delete(creator.toLowerCase());
      for (const creator of message.addCreators ?? [])
        if (
          typeof creator === "string" &&
          /^(?:[a-z0-9_]{1,15}|[a-z0-9.-]{1,253}:[a-z0-9_@/.-]{1,150})$/i.test(
            creator,
          )
        )
          creators.add(creator.toLowerCase());
      const settings = normalizeSettings({
        ...current,
        ...patch,
        allowedCreators: [...creators],
      });
      await storage.local.set({ settings });
      return settings;
    });
    queue = task.catch(() => {});
    return task;
  };
}
export function normalizeExceptions(input) {
  return [
    ...new Set(
      (Array.isArray(input) ? input : []).filter(
        (value) => typeof value === "string" && /^[a-f0-9]{64}$/.test(value),
      ),
    ),
  ].slice(-200);
}
export function correctionWriter(storage) {
  let queue = Promise.resolve();
  return (hash) => {
    const task = queue.then(async () => {
      if (hash === "clear") {
        await storage.local.set({ mediaExceptions: [] });
        return 0;
      }
      if (!/^[a-f0-9]{64}$/.test(hash ?? ""))
        throw new Error("Invalid exception");
      const current = normalizeExceptions(
        (await storage.local.get("mediaExceptions")).mediaExceptions,
      );
      const next = normalizeExceptions([...current, hash]);
      await storage.local.set({ mediaExceptions: next });
      return next.length;
    });
    queue = task.catch(() => {});
    return task;
  };
}
