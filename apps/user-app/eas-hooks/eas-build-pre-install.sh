#!/bin/bash
# EAS Build: Install monorepo dependencies from root
set -eo pipefail

# Navigate to monorepo root
cd ../..

# Install pnpm
corepack enable
corepack prepare pnpm@10.12.1 --activate

# Install all workspace dependencies
pnpm install --frozen-lockfile || pnpm install
