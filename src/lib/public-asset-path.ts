export function getPublicAssetPath(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') ?? '';

  return `${configuredBasePath}${normalizedPath}`;
}
