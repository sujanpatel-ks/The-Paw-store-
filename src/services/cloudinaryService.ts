import crypto from "crypto";

export function generateCloudinarySignature(params: Record<string, any>, apiSecret: string): string {
  // Sort parameters alphabetically (excluding file, cloud_name, resource_type, api_key, signature)
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join("&");

  // Hash parameter string concatenated with API Secret using SHA-1
  return crypto
    .createHash("sha1")
    .update(paramString + apiSecret)
    .digest("hex");
}
