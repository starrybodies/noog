import { excludedContext } from "./policy.js";
export function isJpegFrame(value) {
  return (
    typeof value === "string" &&
    value.length <= 100000 &&
    /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value)
  );
}
export function publicImageUrl(url) {
  const host = url.hostname.toLowerCase();
  return (
    ["http:", "https:"].includes(url.protocol) &&
    !url.username &&
    !url.password &&
    host.includes(".") &&
    host !== "localhost" &&
    !/\.(localhost|local|internal)$/.test(host) &&
    !host.includes(":") &&
    !host.startsWith("[") &&
    !/^\d+\.\d+\.\d+\.\d+$/.test(host) &&
    !excludedContext(url.href)
  );
}
