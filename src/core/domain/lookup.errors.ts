export abstract class LookupDomainError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class MissingProviderKeyError extends LookupDomainError {
  constructor(public readonly envKeyName: string) {
    super(`Missing ${envKeyName} in .env.local or switch to auto/mock mode.`);
  }
}

export class LiveProviderUnavailableError extends LookupDomainError {
  constructor(
    public readonly providerName: string,
    options?: ErrorOptions
  ) {
    super(`${providerName} live provider failed to respond.`, options);
  }
}
