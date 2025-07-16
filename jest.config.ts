import { getJestProjectsAsync } from '@nx/jest';

export default async () => ({
  projects: await getJestProjectsAsync(),
  testMatch: ['**/tests/**/*.ts', '**/__tests__/**/*.ts'],
});
