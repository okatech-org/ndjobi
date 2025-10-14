#!/usr/bin/env bun

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface DeployConfig {
  environment: 'staging' | 'production';
  skipTests?: boolean;
  skipBuild?: boolean;
  skipBlockchain?: boolean;
  dryRun?: boolean;
}

class NdjobiDeployer {
  private config: DeployConfig;
  
  constructor(config: DeployConfig) {
    this.config = config;
  }

  private log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    const colors = {
      info: '\x1b[36m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
    };
    const reset = '\x1b[0m';
    console.log(`${colors[level]}[DEPLOY] ${message}${reset}`);
  }

  private exec(command: string, cwd?: string): string {
    this.log(`Executing: ${command}`);
    if (this.config.dryRun) {
      this.log('(DRY RUN - Command skipped)', 'warn');
      return '';
    }
    return execSync(command, { 
      cwd: cwd || process.cwd(),
      encoding: 'utf-8',
      stdio: 'inherit'
    }).toString();
  }

  private checkPrerequisites() {
    this.log('🔍 Checking prerequisites...');
    
    // Vérifier Node.js et Bun
    try {
      this.exec('bun --version');
    } catch {
      throw new Error('Bun is required but not installed');
    }

    // Vérifier les variables d'environnement critiques
    const requiredEnvVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_PUBLISHABLE_KEY',
    ];

    const missingVars = requiredEnvVars.filter(v => !process.env[v]);
    if (missingVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
    }

    // Vérifier la configuration blockchain si nécessaire
    if (!this.config.skipBlockchain && this.config.environment === 'production') {
      if (!process.env.VITE_NDJOBI_CONTRACT_ADDRESS || process.env.VITE_NDJOBI_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        throw new Error('Blockchain contract address must be configured for production');
      }
    }

    this.log('✅ Prerequisites check passed');
  }

  private async runTests() {
    if (this.config.skipTests) {
      this.log('⚠️ Skipping tests', 'warn');
      return;
    }

    this.log('🧪 Running tests...');
    try {
      this.exec('bun run test:coverage');
      this.log('✅ All tests passed');
    } catch (error) {
      this.log('❌ Tests failed', 'error');
      throw error;
    }
  }

  private typeCheck() {
    this.log('📝 Running TypeScript type check...');
    try {
      this.exec('bun run type-check');
      this.log('✅ TypeScript check passed');
    } catch (error) {
      this.log('❌ TypeScript errors found', 'error');
      throw error;
    }
  }

  private lint() {
    this.log('🔍 Running linter...');
    try {
      this.exec('bun run lint');
      this.log('✅ Linting passed');
    } catch (error) {
      this.log('❌ Linting errors found', 'error');
      throw error;
    }
  }

  private buildApp() {
    if (this.config.skipBuild) {
      this.log('⚠️ Skipping build', 'warn');
      return;
    }

    this.log('🔨 Building application...');
    try {
      const buildMode = this.config.environment === 'production' ? 'build' : 'build:dev';
      this.exec(`bun run ${buildMode}`);
      this.log('✅ Build completed successfully');

      // Vérifier la taille du bundle
      this.checkBundleSize();
    } catch (error) {
      this.log('❌ Build failed', 'error');
      throw error;
    }
  }

  private checkBundleSize() {
    this.log('📦 Analyzing bundle size...');
    
    const distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distPath)) {
      this.log('⚠️ Dist folder not found', 'warn');
      return;
    }

    // Calculer la taille totale
    let totalSize = 0;
    const calculateSize = (dir: string) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          calculateSize(filePath);
        } else {
          totalSize += stat.size;
        }
      });
    };

    calculateSize(distPath);
    const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
    
    this.log(`📊 Total bundle size: ${sizeMB} MB`);
    
    // Avertissement si le bundle est trop gros
    if (totalSize > 5 * 1024 * 1024) { // 5MB
      this.log(`⚠️ Bundle size is large (${sizeMB} MB). Consider optimization.`, 'warn');
    }
  }

  private async deployBlockchain() {
    if (this.config.skipBlockchain) {
      this.log('⚠️ Skipping blockchain deployment', 'warn');
      return;
    }

    if (!fs.existsSync('hardhat.config.ts')) {
      this.log('⚠️ Hardhat not configured, skipping blockchain deployment', 'warn');
      return;
    }

    this.log('⛓️ Deploying smart contracts...');
    try {
      // Compiler les contrats
      this.exec('bun run blockchain:compile');

      // Déployer selon l'environnement
      const network = this.config.environment === 'production' ? 'polygon' : 'sepolia';
      this.exec(`hardhat run scripts/deploy.ts --network ${network}`);
      
      this.log('✅ Smart contracts deployed successfully');
    } catch (error) {
      this.log('❌ Blockchain deployment failed', 'error');
      throw error;
    }
  }

  private async deployToNetlify() {
    this.log('🌐 Deploying to Netlify...');
    
    try {
      // Installer Netlify CLI si nécessaire
      try {
        this.exec('netlify --version');
      } catch {
        this.log('Installing Netlify CLI...');
        this.exec('npm install -g netlify-cli');
      }

      // Déployer
      const deployCmd = this.config.environment === 'production' 
        ? 'netlify deploy --prod --dir=dist'
        : 'netlify deploy --dir=dist';
        
      this.exec(deployCmd);
      this.log('✅ Deployed to Netlify successfully');
    } catch (error) {
      this.log('❌ Netlify deployment failed', 'error');
      throw error;
    }
  }

  private async deployToVercel() {
    this.log('▲ Deploying to Vercel...');
    
    try {
      // Installer Vercel CLI si nécessaire
      try {
        this.exec('vercel --version');
      } catch {
        this.log('Installing Vercel CLI...');
        this.exec('npm install -g vercel');
      }

      // Déployer
      const deployCmd = this.config.environment === 'production' 
        ? 'vercel --prod'
        : 'vercel';
        
      this.exec(deployCmd);
      this.log('✅ Deployed to Vercel successfully');
    } catch (error) {
      this.log('❌ Vercel deployment failed', 'error');
      throw error;
    }
  }

  private generateDeploymentReport() {
    this.log('📋 Generating deployment report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
      version: process.env.VITE_APP_VERSION || '1.0.0',
      git_commit: this.getGitCommit(),
      git_branch: this.getGitBranch(),
      node_version: process.version,
      config: {
        skip_tests: this.config.skipTests || false,
        skip_build: this.config.skipBuild || false,
        skip_blockchain: this.config.skipBlockchain || false,
        dry_run: this.config.dryRun || false,
      },
    };

    fs.writeFileSync(
      `deployment-report-${this.config.environment}-${Date.now()}.json`,
      JSON.stringify(report, null, 2)
    );

    this.log(`📊 Deployment report saved`);
  }

  private getGitCommit(): string {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    } catch {
      return 'unknown';
    }
  }

  private getGitBranch(): string {
    try {
      return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    } catch {
      return 'unknown';
    }
  }

  private checkPostDeploy() {
    this.log('🔍 Running post-deployment checks...');
    
    // Vérifier que les variables d'environnement sont correctes
    const criticalVars = [
      'VITE_ENVIRONMENT',
      'VITE_SUPABASE_URL',
      'VITE_NDJOBI_CONTRACT_ADDRESS',
    ];

    const issues = [];
    criticalVars.forEach(varName => {
      const value = process.env[varName];
      if (!value) {
        issues.push(`Missing: ${varName}`);
      } else if (value.includes('localhost') && this.config.environment === 'production') {
        issues.push(`Production has localhost in: ${varName}`);
      }
    });

    if (issues.length > 0) {
      this.log('⚠️ Post-deployment issues found:', 'warn');
      issues.forEach(issue => this.log(`  - ${issue}`, 'warn'));
    } else {
      this.log('✅ Post-deployment checks passed');
    }
  }

  async deploy() {
    const startTime = Date.now();
    
    try {
      this.log(`🚀 Starting deployment to ${this.config.environment}`);
      
      if (this.config.dryRun) {
        this.log('🔍 DRY RUN MODE - No actual changes will be made', 'warn');
      }

      // Étapes de déploiement
      this.checkPrerequisites();
      this.typeCheck();
      this.lint();
      await this.runTests();
      this.buildApp();
      await this.deployBlockchain();
      
      // Choisir la plateforme de déploiement
      if (process.env.DEPLOY_TARGET === 'vercel') {
        await this.deployToVercel();
      } else {
        await this.deployToNetlify(); // Par défaut
      }

      this.checkPostDeploy();
      this.generateDeploymentReport();

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.log(`🎉 Deployment to ${this.config.environment} completed successfully in ${duration}s`);

    } catch (error) {
      this.log(`💥 Deployment failed: ${error}`, 'error');
      process.exit(1);
    }
  }
}

// Script principal
async function main() {
  const args = process.argv.slice(2);
  
  const config: DeployConfig = {
    environment: (args.find(arg => arg.startsWith('--env='))?.split('=')[1] as any) || 'staging',
    skipTests: args.includes('--skip-tests'),
    skipBuild: args.includes('--skip-build'),
    skipBlockchain: args.includes('--skip-blockchain'),
    dryRun: args.includes('--dry-run'),
  };

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🚀 Ndjobi Deployment Script

Usage: bun run deploy [options]

Options:
  --env=staging|production    Target environment (default: staging)
  --skip-tests               Skip running tests
  --skip-build               Skip building the app
  --skip-blockchain          Skip blockchain deployment
  --dry-run                  Show what would be done without executing
  --help, -h                 Show this help message

Examples:
  bun run deploy                           # Deploy to staging
  bun run deploy --env=production          # Deploy to production
  bun run deploy --env=staging --dry-run   # Dry run for staging
  bun run deploy --skip-tests              # Deploy without running tests
    `);
    process.exit(0);
  }

  const deployer = new NdjobiDeployer(config);
  await deployer.deploy();
}

if (require.main === module) {
  main().catch(console.error);
}
