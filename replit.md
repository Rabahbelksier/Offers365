# Offers 365 - Replit Agent Guide

## Overview

Offers 365 is a mobile utility application for AliExpress deal hunters. It aggregates promotional affiliate links and product details, helping users maximize savings and commissions. The app extracts product information from AliExpress URLs, generates multiple affiliate tracking links, and provides easy sharing/copying functionality.

**Core Purpose**: Power-user tool for generating and managing AliExpress affiliate links with product metadata extraction.

**Target Platforms**: iOS, Android, and Web (via Expo)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture (Expo/React Native)

**Framework**: Expo SDK 54 with React Native 0.81, using the new architecture and React Compiler experimental features.

**Navigation Structure**:
- Root: Drawer Navigator (hamburger menu) containing Home, Settings, Message Design, App Guide
- Modal Stack: Product Details presented as a card modal from Home
- Persistent elements: Hamburger icon (top-left), Share icon (top-right), Social media footer on all screens

**State Management**:
- TanStack React Query for server state and API calls
- AsyncStorage for local persistence (recent products, settings, message templates)
- No authentication required - purely local utility tool

**Theming System**:
- Automatic light/dark mode support following system preferences
- AliExpress-inspired color palette (Primary: #FF6A00 orange, Secondary: #F5222D red, Accent: #FFD700 gold)
- Custom theme hook (`useTheme`) providing consistent color tokens

**Key UI Patterns**:
- Dual-action pattern: Every offer has three touch points (open, copy, share) in consistent horizontal layout
- Bold/commercial aesthetic with high-contrast, attention-grabbing design
- Montserrat font family for typography

### Backend Architecture (Express.js)

**Server Framework**: Express 5 with TypeScript, running on Node.js

**API Responsibilities**:
- Product data extraction from AliExpress URLs via web scraping (Cheerio)
- Affiliate link generation using AliExpress API (`api-sg.aliexpress.com/sync`)
- URL resolution and product ID extraction from various AliExpress URL formats
- CORS handling for Expo web development

**Key Endpoints**:
- Product search/extraction endpoint that accepts AliExpress URLs
- Returns product metadata (title, image, price, store info) and generated affiliate offers

**Scraping Strategy**:
- Primary: AliExpress affiliate API for offer generation
- Fallback: Web scraping with Cheerio for title/image when API doesn't support product

### Data Layer

**Database**: PostgreSQL with Drizzle ORM (schema in `shared/schema.ts`)
- Currently minimal schema with users table
- Database connection via `DATABASE_URL` environment variable

**Local Storage** (AsyncStorage):
- Recent products history
- User settings (language, theme, API credentials)
- Message template customization

### Build & Development

**Development Scripts**:
- `npm run expo:dev` - Start Expo development server
- `npm run server:dev` - Start Express backend with tsx
- `npm run db:push` - Push Drizzle schema to database

**Production Build**:
- `npm run expo:static:build` - Build static web bundle
- `npm run server:build` - Bundle server with esbuild
- `npm run server:prod` - Run production server

**Path Aliases**:
- `@/` → `./client/`
- `@shared/` → `./shared/`

## External Dependencies

### AliExpress Integration
- **API Endpoint**: `https://api-sg.aliexpress.com/sync`
- **Authentication**: App Key, App Secret, Tracking ID (stored in user settings)
- **Purpose**: Generate affiliate tracking links and fetch product offers

### Third-Party Services
- **Social Links**: Telegram (@rabahcopons), Facebook, TikTok channels for app promotion

### Key NPM Dependencies
- **expo** (SDK 54): Core mobile framework
- **@tanstack/react-query**: Server state management
- **drizzle-orm** + **pg**: Database ORM and PostgreSQL driver
- **cheerio**: HTML parsing for web scraping fallback
- **crypto-js**: Cryptographic operations for API authentication
- **react-native-reanimated**: Animation library
- **expo-clipboard**, **expo-haptics**, **expo-image**: Native feature access

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `EXPO_PUBLIC_DOMAIN`: Public domain for API calls
- `REPLIT_DEV_DOMAIN`: Development domain (auto-set by Replit)