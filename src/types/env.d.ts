declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_API_URL?: string;
    readonly NEXT_PUBLIC_BASE_PATH?: string;
    readonly NODE_ENV: 'development' | 'production' | 'test';
  }
}
