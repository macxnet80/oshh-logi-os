import { createLuccaClient } from "@/lib/hr-sync/providers/lucca";
import { createPersonioClient } from "@/lib/hr-sync/providers/personio";
import type { HrProvider, HrProviderClient } from "@/lib/hr-sync/types";

export function getConfiguredHrProvider(): HrProvider {
  const provider = (process.env.HR_PROVIDER ?? "personio").toLowerCase();
  if (provider === "personio" || provider === "lucca") {
    return provider;
  }
  throw new Error(`Ungültiger HR_PROVIDER: ${provider}`);
}

export function createHrProviderClient(provider = getConfiguredHrProvider()): HrProviderClient {
  if (provider === "personio") return createPersonioClient();
  return createLuccaClient();
}
