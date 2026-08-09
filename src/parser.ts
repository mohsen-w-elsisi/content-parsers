export interface Parser<TOutput = unknown> {
  parse(): Promise<TOutput[]>;
}
