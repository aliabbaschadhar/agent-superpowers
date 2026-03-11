import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { TECH_SKILL_MAP } from './techSkillMap';

/** npm package names → tech token */
const PKG_DEP_MAP: Record<string, string> = {
  // React family
  react: 'react',
  'react-dom': 'react',
  next: 'nextjs',
  // Vue / Angular / Svelte
  vue: 'vue',
  '@angular/core': 'angular',
  svelte: 'svelte',
  // Node frameworks
  express: 'express',
  fastify: 'fastify',
  '@nestjs/core': 'nestjs',
  // React Native / Expo
  'react-native': 'react-native',
  expo: 'expo',
  // Databases / ORMs
  '@prisma/client': 'prisma',
  prisma: 'prisma',
  mongoose: 'mongodb',
  pg: 'postgres',
  'pg-promise': 'postgres',
  ioredis: 'redis',
  redis: 'redis',
  mysql2: 'mysql',
  'better-sqlite3': 'sqlite',
  // GraphQL / tRPC
  graphql: 'graphql',
  '@trpc/server': 'trpc',
  '@trpc/client': 'trpc',
  // Testing
  jest: 'jest',
  vitest: 'vitest',
  '@playwright/test': 'playwright',
  playwright: 'playwright',
  cypress: 'cypress',
  // CSS
  tailwindcss: 'tailwindcss',
  // Build
  vite: 'vite',
  turbo: 'turborepo',
  nx: 'nx',
  // AI / LLM
  langchain: 'langchain',
  '@langchain/core': 'langchain',
  openai: 'openai',
  '@anthropic-ai/sdk': 'anthropic',
  // Payments
  stripe: 'stripe',
  // TypeScript (handled separately via tsconfig check too)
  typescript: 'typescript',
};

/** Python package names → tech token */
const PY_PACKAGE_MAP: Record<string, string> = {
  fastapi: 'fastapi',
  django: 'django',
  flask: 'flask',
  pytest: 'pytest',
  sqlalchemy: 'python',
  pydantic: 'fastapi',
  uvicorn: 'fastapi',
  openai: 'openai',
  anthropic: 'anthropic',
  langchain: 'langchain',
  langchain_core: 'langchain',
};

/**
 * Scans the current workspace folders and returns a deduplicated list of
 * lowercase technology tokens whose skills should be recommended.
 */
export class WorkspaceScanner {
  /**
   * Scan for technology tokens.
   * @param folderPath  When provided, scans only that directory (project-specific).
   *                    When omitted, scans all workspace folders.
   */
  async scan(folderPath?: string): Promise<string[]> {
    const tokens = new Set<string>();
    const knownTokens = new Set(Object.keys(TECH_SKILL_MAP));

    if (folderPath) {
      await this.scanFolder(folderPath, tokens, knownTokens);
    } else {
      const folders = vscode.workspace.workspaceFolders;
      if (!folders || folders.length === 0) {
        return [];
      }
      for (const folder of folders) {
        await this.scanFolder(folder.uri.fsPath, tokens, knownTokens);
      }
    }

    return [...tokens];
  }

  private async scanFolder(
    root: string,
    tokens: Set<string>,
    knownTokens: Set<string>
  ): Promise<void> {
    this.parsePackageJsonDeps(root, tokens);
    this.detectFilePresence(root, tokens);
    this.parsePythonDeps(root, tokens);

    // Remove tokens that have no skill mapping (keeps results clean)
    for (const tok of [...tokens]) {
      if (!knownTokens.has(tok)) {
        tokens.delete(tok);
      }
    }
  }

  private parsePackageJsonDeps(root: string, tokens: Set<string>): void {
    const pkgPath = path.join(root, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      return;
    }
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as Record<string, unknown>;
      const allDeps: Record<string, unknown> = {
        ...((pkg.dependencies as Record<string, unknown>) ?? {}),
        ...((pkg.devDependencies as Record<string, unknown>) ?? {}),
      };
      for (const dep of Object.keys(allDeps)) {
        const tok = PKG_DEP_MAP[dep];
        if (tok) {
          tokens.add(tok);
        }
      }
      if (fs.existsSync(path.join(root, 'tsconfig.json')) || allDeps['typescript']) {
        tokens.add('typescript');
      }
    } catch {
      /* malformed JSON — skip */
    }
  }

  private detectFilePresence(root: string, tokens: Set<string>): void {
    if (fs.existsSync(path.join(root, 'go.mod'))) {
      tokens.add('go');
    }
    if (fs.existsSync(path.join(root, 'Cargo.toml'))) {
      tokens.add('rust');
    }

    const hasPyFiles =
      fs.existsSync(path.join(root, 'requirements.txt')) ||
      fs.existsSync(path.join(root, 'pyproject.toml')) ||
      fs.existsSync(path.join(root, 'setup.py')) ||
      fs.existsSync(path.join(root, 'Pipfile'));
    if (hasPyFiles) {
      tokens.add('python');
      this.parsePythonDeps(root, tokens);
    }

    if (
      fs.existsSync(path.join(root, 'pom.xml')) ||
      fs.existsSync(path.join(root, 'build.gradle')) ||
      fs.existsSync(path.join(root, 'build.gradle.kts'))
    ) {
      tokens.add('java');
      if (
        fs.existsSync(path.join(root, 'build.gradle.kts')) ||
        fs.existsSync(path.join(root, 'src', 'main', 'kotlin'))
      ) {
        tokens.add('kotlin');
      }
      try {
        const pomPath = path.join(root, 'pom.xml');
        if (fs.existsSync(pomPath)) {
          const pom = fs.readFileSync(pomPath, 'utf-8');
          if (pom.includes('spring-boot') || pom.includes('spring-framework')) {
            tokens.add('spring');
          }
        }
      } catch {
        /* ignore */
      }
    }

    if (this.anyFileInRoot(root, '.csproj') || this.anyFileInRoot(root, '.sln')) {
      tokens.add('dotnet');
      tokens.add('csharp');
    }

    if (
      fs.existsSync(path.join(root, 'Dockerfile')) ||
      fs.existsSync(path.join(root, 'docker-compose.yml')) ||
      fs.existsSync(path.join(root, 'docker-compose.yaml'))
    ) {
      tokens.add('docker');
    }

    if (this.anyFileInRoot(root, '.tf')) {
      tokens.add('terraform');
    }

    if (
      fs.existsSync(path.join(root, 'k8s')) ||
      fs.existsSync(path.join(root, 'kubernetes')) ||
      this.hasSubdir(root, 'helm')
    ) {
      tokens.add('kubernetes');
    }

    if (this.anyFileInRoot(root, '.xcodeproj') || this.anyFileInRoot(root, '.swift')) {
      tokens.add('swift');
    }

    if (
      fs.existsSync(path.join(root, 'AndroidManifest.xml')) ||
      fs.existsSync(path.join(root, 'app', 'src', 'main', 'AndroidManifest.xml'))
    ) {
      tokens.add('android');
    }
  }

  private parsePythonDeps(root: string, tokens: Set<string>): void {
    // requirements.txt
    const reqPath = path.join(root, 'requirements.txt');
    if (fs.existsSync(reqPath)) {
      try {
        const lines = fs.readFileSync(reqPath, 'utf-8').split('\n');
        for (const line of lines) {
          const pkg = line
            .split(/[>=<!\[; ]/)[0]
            .trim()
            .toLowerCase();
          const tok = PY_PACKAGE_MAP[pkg];
          if (tok) {
            tokens.add(tok);
          }
        }
      } catch {
        /* ignore */
      }
    }

    // pyproject.toml — simple text scan for known packages
    const pyprojectPath = path.join(root, 'pyproject.toml');
    if (fs.existsSync(pyprojectPath)) {
      try {
        const content = fs.readFileSync(pyprojectPath, 'utf-8').toLowerCase();
        for (const [pkg, tok] of Object.entries(PY_PACKAGE_MAP)) {
          if (content.includes(`"${pkg}"`) || content.includes(`'${pkg}'`)) {
            tokens.add(tok);
          }
        }
      } catch {
        /* ignore */
      }
    }
  }

  /** True if any file in the immediate root directory ends with `ext`. */
  private anyFileInRoot(root: string, ext: string): boolean {
    try {
      return fs.readdirSync(root).some((f) => f.endsWith(ext));
    } catch {
      return false;
    }
  }

  /** True if a direct subdirectory named `name` exists under root. */
  private hasSubdir(root: string, name: string): boolean {
    try {
      const full = path.join(root, name);
      return fs.existsSync(full) && fs.statSync(full).isDirectory();
    } catch {
      return false;
    }
  }
}
