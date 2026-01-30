# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React 19 + TypeScript + Vite frontend project named "PomingMatgo" (appears to be related to GoStop, a Korean card game). The project is currently in early stages with a minimal structure.

## Tech Stack

- **React**: 19.2.0 (with StrictMode enabled)
- **TypeScript**: ~5.9.3 with strict mode enabled
- **Build Tool**: Vite 7.2.4
- **Linting**: ESLint with TypeScript, React Hooks, and React Refresh plugins

## Commands

### Development
```bash
npm run dev          # Start Vite dev server with HMR
npm run preview      # Preview production build locally
```

### Build & Quality
```bash
npm run build        # TypeScript type-check (tsc -b) + Vite production build
npm run lint         # Run ESLint on the codebase
```

## TypeScript Configuration

The project uses TypeScript with strict linting rules enabled:
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- `noUncheckedSideEffectImports: true`

When writing TypeScript code, ensure compliance with these strict rules.

## Project Structure

Currently minimal structure:
- `src/main.tsx` - Application entry point with React root
- `src/App.tsx` - Main App component
- `src/index.css` - Global styles
- `src/assets/` - Static assets

## ESLint Configuration

The ESLint setup uses the flat config format and includes:
- Standard JavaScript/TypeScript recommended rules
- React Hooks rules (enforces hooks best practices)
- React Refresh rules (for Vite HMR compatibility)
- Ignores `dist/` directory

All `.ts` and `.tsx` files are linted with these rules.
