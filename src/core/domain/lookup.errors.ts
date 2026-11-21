export class MissingProviderKeyError extends Error {
  constructor(public readonly envKeyName: string) {
    super(`Missing ${envKeyName} in .env.local or switch to auto/mock mode.`);
    this.name = "MissingProviderKeyError";
  }
}

export class LiveProviderUnavailableError extends Error {
  constructor(public readonly providerName: string) {
    super(`${providerName} live provider failed to respond.`);
    this.name = "LiveProviderUnavailableError";
  }
}
