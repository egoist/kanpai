declare module "commits-between" {
  const mod: (opts: {
    from?: string;
    to?: string;
  }) => Promise<{ subject: string; body: string; author: { date: Date } }[]>;
  export default mod;
}

declare module "is-semver" {
  const mod: (value: string) => boolean;
  export default mod;
}
