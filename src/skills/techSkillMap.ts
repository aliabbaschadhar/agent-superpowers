/**
 * Maps lowercase technology tokens (as detected by WorkspaceScanner) to a
 * curated ordered list of skill IDs most relevant for that tech.
 *
 * Curated lists are tried first; unknown tokens fall back to fuzzy
 * id/description matching inside getRecommended().
 */
export const TECH_SKILL_MAP: Record<string, string[]> = {
  // ── Frontend ────────────────────────────────────────────────────────────────
  react: [
    'react-patterns',
    'react-best-practices',
    'react-state-management',
    'react-ui-patterns',
    'react-nextjs-development',
  ],
  next: [
    'nextjs-best-practices',
    'nextjs-app-router-patterns',
    'react-patterns',
    'react-nextjs-development',
  ],
  nextjs: [
    'nextjs-best-practices',
    'nextjs-app-router-patterns',
    'react-patterns',
    'react-nextjs-development',
  ],
  vue: ['frontend-developer', 'frontend-design', 'javascript-pro'],
  angular: [
    'angular',
    'angular-best-practices',
    'angular-state-management',
    'angular-ui-patterns',
    'angular-migration',
  ],
  svelte: ['frontend-developer', 'frontend-design', 'javascript-pro'],
  tailwindcss: ['tailwind-patterns', 'tailwind-design-system', 'frontend-design'],
  tailwind: ['tailwind-patterns', 'tailwind-design-system', 'frontend-design'],
  vite: ['react-patterns', 'javascript-pro', 'frontend-developer'],
  // ── Node / Backend ──────────────────────────────────────────────────────────
  express: [
    'nodejs-backend-patterns',
    'nodejs-best-practices',
    'api-design-principles',
    'backend-dev-guidelines',
  ],
  fastify: ['nodejs-backend-patterns', 'nodejs-best-practices', 'api-design-principles'],
  nestjs: ['nestjs-expert', 'nodejs-backend-patterns', 'api-design-principles'],
  // ── Python ──────────────────────────────────────────────────────────────────
  python: [
    'python-patterns',
    'python-pro',
    'python-testing-patterns',
    'async-python-patterns',
    'python-performance-optimization',
  ],
  fastapi: [
    'fastapi-pro',
    'fastapi-templates',
    'fastapi-router-py',
    'python-patterns',
    'api-design-principles',
  ],
  django: ['django-pro', 'python-patterns', 'api-design-principles'],
  flask: ['python-patterns', 'api-design-principles', 'python-pro'],
  pytest: ['python-testing-patterns', 'python-patterns', 'tdd-workflow'],
  // ── Go ──────────────────────────────────────────────────────────────────────
  go: ['golang-pro', 'go-concurrency-patterns', 'api-design-principles'],
  golang: ['golang-pro', 'go-concurrency-patterns', 'api-design-principles'],
  // ── Rust ────────────────────────────────────────────────────────────────────
  rust: ['rust-pro', 'rust-async-patterns', 'memory-safety-patterns'],
  // ── Java / JVM ──────────────────────────────────────────────────────────────
  java: ['java-pro', 'api-design-principles', 'architecture-patterns'],
  kotlin: ['kotlin-coroutines-expert', 'android-jetpack-compose-expert', 'java-pro'],
  spring: ['java-pro', 'api-design-principles', 'architecture-patterns'],
  // ── .NET ────────────────────────────────────────────────────────────────────
  dotnet: ['dotnet-backend', 'dotnet-backend-patterns', 'csharp-pro'],
  csharp: ['csharp-pro', 'dotnet-backend', 'dotnet-backend-patterns'],
  // ── Mobile ──────────────────────────────────────────────────────────────────
  'react-native': ['react-native-architecture', 'react-patterns', 'mobile-design'],
  expo: ['react-native-architecture', 'expo-deployment', 'mobile-design'],
  flutter: ['flutter-expert', 'mobile-design'],
  swift: ['ios-developer', 'swiftui-expert-skill', 'hig-foundations'],
  android: ['android-jetpack-compose-expert', 'kotlin-coroutines-expert', 'mobile-design'],
  // ── Databases ───────────────────────────────────────────────────────────────
  postgres: ['postgresql', 'postgres-best-practices', 'sql-optimization-patterns'],
  postgresql: ['postgresql', 'postgres-best-practices', 'sql-optimization-patterns'],
  prisma: ['prisma-expert', 'database-design', 'postgresql'],
  mongodb: ['nosql-expert', 'database-design'],
  redis: ['bullmq-specialist', 'database-design'],
  mysql: ['sql-optimization-patterns', 'database-design'],
  sqlite: ['sql-optimization-patterns', 'database-design'],
  // ── Cloud / Infra ────────────────────────────────────────────────────────────
  terraform: ['terraform-skill', 'terraform-module-library', 'aws-skills'],
  docker: ['docker-expert', 'cloud-devops', 'kubernetes-deployment'],
  kubernetes: ['kubernetes-deployment', 'k8s-manifest-generator', 'k8s-security-policies'],
  aws: ['aws-skills', 'aws-serverless', 'cdk-patterns'],
  gcp: ['gcp-cloud-run', 'cloud-devops'],
  azure: ['azd-deployment', 'azure-functions', 'cloud-devops'],
  // ── API ──────────────────────────────────────────────────────────────────────
  graphql: ['graphql', 'graphql-architect', 'api-design-principles'],
  trpc: ['api-patterns', 'api-design-principles', 'typescript-expert'],
  // ── Testing ──────────────────────────────────────────────────────────────────
  jest: ['javascript-testing-patterns', 'testing-patterns', 'tdd-workflow'],
  vitest: ['javascript-testing-patterns', 'testing-patterns', 'tdd-workflow'],
  playwright: ['playwright-skill', 'e2e-testing', 'e2e-testing-patterns'],
  cypress: ['e2e-testing-patterns', 'e2e-testing', 'javascript-testing-patterns'],
  // ── AI / LLM ─────────────────────────────────────────────────────────────────
  langchain: ['langchain-architecture', 'ai-engineer', 'rag-engineer'],
  openai: ['ai-engineer', 'llm-app-patterns', 'prompt-engineering'],
  anthropic: ['ai-engineer', 'prompt-engineering', 'llm-app-patterns'],
  // ── TypeScript ───────────────────────────────────────────────────────────────
  typescript: ['typescript-expert', 'typescript-advanced-types', 'typescript-pro'],
  // ── Monorepo ─────────────────────────────────────────────────────────────────
  turborepo: ['turborepo-caching', 'monorepo-management', 'monorepo-architect'],
  nx: ['nx-workspace-patterns', 'monorepo-management', 'monorepo-architect'],
  // ── Payments ─────────────────────────────────────────────────────────────────
  stripe: ['stripe-integration', 'billing-automation', 'pci-compliance'],
};

/** Human-readable display names for tech tokens used in the sidebar description. */
export const TECH_DISPLAY_NAMES: Record<string, string> = {
  react: 'React',
  next: 'Next.js',
  nextjs: 'Next.js',
  vue: 'Vue',
  angular: 'Angular',
  svelte: 'Svelte',
  tailwindcss: 'Tailwind',
  tailwind: 'Tailwind',
  vite: 'Vite',
  express: 'Express',
  fastify: 'Fastify',
  nestjs: 'NestJS',
  python: 'Python',
  fastapi: 'FastAPI',
  django: 'Django',
  flask: 'Flask',
  pytest: 'pytest',
  go: 'Go',
  golang: 'Go',
  rust: 'Rust',
  java: 'Java',
  kotlin: 'Kotlin',
  spring: 'Spring',
  dotnet: '.NET',
  csharp: 'C#',
  'react-native': 'React Native',
  expo: 'Expo',
  flutter: 'Flutter',
  swift: 'Swift',
  android: 'Android',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  prisma: 'Prisma',
  mongodb: 'MongoDB',
  redis: 'Redis',
  mysql: 'MySQL',
  sqlite: 'SQLite',
  terraform: 'Terraform',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  aws: 'AWS',
  gcp: 'GCP',
  azure: 'Azure',
  graphql: 'GraphQL',
  trpc: 'tRPC',
  jest: 'Jest',
  vitest: 'Vitest',
  playwright: 'Playwright',
  cypress: 'Cypress',
  langchain: 'LangChain',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  typescript: 'TypeScript',
  turborepo: 'Turborepo',
  nx: 'Nx',
  stripe: 'Stripe',
};
