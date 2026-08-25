export function getPublicAssetPath(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') ?? '';
  const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
  const githubPagesBasePath =
    process.env.GITHUB_ACTIONS === 'true' &&
    repositoryName &&
    !repositoryName.endsWith('.github.io')
      ? `/${repositoryName}`
      : '';

  return `${configuredBasePath || githubPagesBasePath}${normalizedPath}`;
}
