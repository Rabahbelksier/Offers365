# Offers 365 - Design Guidelines

## Brand Identity

**Purpose**: Offers 365 is a power-user tool for AliExpress deal hunters. It aggregates multiple promotional links and product details instantly, helping users maximize savings and commissions.

**Aesthetic Direction**: **Bold/Commercial** - High-contrast, attention-grabbing design inspired by promotional marketplaces. Think vibrant deal banners, clear CTAs, and information-dense layouts that feel urgent and valuable without being cluttered.

**Memorable Element**: The dual-action pattern - every offer has THREE touch points (open, copy, share) always visible in a consistent horizontal layout, making the app feel like a power tool rather than a simple browser.

## Navigation Architecture

**Root Navigation**: Persistent Drawer (hamburger menu)
- Drawer contains: Home, Settings, Message Design, App Guide
- Hamburger icon visible in header on ALL screens (top-left)
- Share App icon always visible in header (top-right)
- Social media icons footer present on ALL screens

**Screen Hierarchy**:
1. Home (stack root)
2. Product Details (modal from Home)
3. Settings (stack from drawer)
4. Message Design (stack from drawer)
5. App Guide (stack from drawer)

No authentication required - this is a utility tool with local storage only.

## Color Palette

**Primary Colors** (AliExpress-inspired):
- Primary: `#FF6A00` (AliExpress Orange) - CTAs, active states, headers
- Secondary: `#F5222D` (AliExpress Red) - urgent actions, sale badges
- Accent: `#FFD700` (Gold) - highlights, success states

**Neutral Colors**:
- Background Light: `#FFFFFF`
- Background Dark: `#1A1A1A`
- Surface Light: `#F8F8F8`
- Surface Dark: `#2C2C2C`
- Border Light: `#E0E0E0`
- Border Dark: `#404040`

**Text Colors**:
- Text Primary Light: `#1A1A1A`
- Text Primary Dark: `#FFFFFF`
- Text Secondary Light: `#666666`
- Text Secondary Dark: `#A0A0A0`

**Semantic Colors**:
- Success: `#52C41A`
- Error: `#FF4D4F`

## Typography

**Font**: **Montserrat** (Google Font) for headers and CTAs, **Roboto** (system default) for body text.

**Type Scale**:
- Heading 1: Montserrat Bold, 28sp, Primary Text
- Heading 2: Montserrat SemiBold, 22sp, Primary Text
- Heading 3: Montserrat SemiBold, 18sp, Primary Text
- Body: Roboto Regular, 16sp, Primary Text
- Body Small: Roboto Regular, 14sp, Secondary Text
- Caption: Roboto Regular, 12sp, Secondary Text
- Button: Montserrat SemiBold, 16sp

## Screen-by-Screen Specifications

### 1. Home Screen
**Purpose**: Input AliExpress links and view search history.

**Layout**:
- Header: Custom with transparent background
  - Left: Hamburger menu icon
  - Center: "Offers 365" in Montserrat Bold, 24sp, Primary color
  - Right: Share app icon
- Content (ScrollView):
  - Top padding: headerHeight + 40dp
  - Center-aligned input section
  - Link input field (multiline, 3 lines visible, hint: "Paste AliExpress product link here...")
  - "Get Offers" button (full-width, 56dp height, Primary color, elevation 2dp)
  - Spacing: 24dp between elements
  - Recent Products section header (Heading 3)
  - List of recent products (cards with thumbnail, title, date)
  - Bottom action bar: "Clear History" and "Refresh" buttons (outlined style)
- Footer: Social media icons (Telegram, Facebook, TikTok) - 40dp icons, 16dp spacing
- Safe area: bottom inset + 16dp

**Components**: TextInput (Material), Elevated Button, Card list, Icon buttons

### 2. Product Details Screen
**Purpose**: Display product information, offers, and action buttons.

**Layout**:
- Modal presentation (full screen)
- Header: Default with back button
  - Left: Back arrow
  - Right: Download image icon
- Content (ScrollView):
  - Product image (full width, aspect ratio 1:1, max height 400dp)
  - Product title (Heading 2, 16dp padding)
  - Product details card (Surface background, 12dp rounded corners):
    - Price (current/original, Heading 3 / strike-through)
    - Discount badge (Secondary color background, Caption white text)
    - Orders count, store name, rating
  - Copy actions row (3 buttons: Copy All, Copy Details, Copy Title) - outlined buttons, 8dp spacing
  - Offers section header (Heading 3, 16dp top margin)
  - 8 offer buttons (full-width, horizontal layout per button):
    - Offer name on left
    - Copy icon (center-right)
    - Share icon (far right)
    - Button height: 64dp, Surface color, border 1dp
  - "Other Offers" button (same style, Accent color)
- Footer: Social media icons
- Safe area: bottom inset + 16dp

**Components**: Image (cached), Text, Badge, Outlined buttons, List of action buttons

### 3. Settings Screen
**Purpose**: Configure app preferences and API keys.

**Layout**:
- Header: Default
  - Left: Hamburger menu
  - Title: "Settings" (center)
  - Right: Share app icon
- Content (ScrollView):
  - Section: "Appearance" (Heading 3)
    - Language dropdown (English/Arabic)
    - Theme toggle (Light/Dark/System)
  - Section: "API Configuration" (Heading 3)
    - APP_KEY input (secure)
    - APP_SECRET input (secure)
    - TRACKING_ID input
    - Save button (Primary color)
  - Section: "About" (Heading 3)
    - App version
    - Privacy policy link
- Footer: Social media icons

**Components**: Dropdown, Toggle switch, Secure TextInput, Button

### 4. Message Design Screen
**Purpose**: Customize copy templates with keywords.

**Layout**:
- Header: Default
  - Left: Hamburger menu
  - Title: "Message Design"
  - Right: Share app icon
- Content (ScrollView):
  - Instructions text (Body Small)
  - Template editor (multiline TextInput, 10 lines, monospace font)
  - Available keywords list (Caption, chip-style):
    - {title}, {price}, {discount}, {store}, etc.
  - Preview section (Surface background, shows rendered template)
  - Save button (Primary color)
- Footer: Social media icons

**Components**: Multiline TextInput, Chip list, Preview card, Button

### 5. App Guide Screen
**Purpose**: Onboarding and feature explanation.

**Layout**:
- Header: Default
  - Left: Hamburger menu
  - Title: "App Guide"
  - Right: Share app icon
- Content (ScrollView):
  - Feature cards (each with icon, heading, description):
    - How to use link input
    - Understanding offers
    - Copy and share features
    - API configuration
    - Message customization
  - Tips section (Surface background, info icon)
- Footer: Social media icons

**Components**: Icon cards, Info panel

## Visual Design

- All buttons have ripple effect on press (Material default)
- Floating action buttons use subtle shadow: shadowOffset (0, 2), shadowOpacity 0.10, shadowRadius 2
- Product cards have 1dp border in light mode, subtle shadow in dark mode
- Empty state for recent products list uses illustration (not generic icon)
- Use Feather icons from @expo/vector-icons for all UI icons
- Input fields have 1dp bottom border (Primary color when focused)

## Assets to Generate

**Required**:
1. **icon.png** - App icon with "365" in Montserrat Bold on Primary/Secondary gradient background, rounded square
2. **splash-icon.png** - Same as app icon, centered on Primary color background
3. **empty-history.png** - Simple illustration of empty shopping cart with subtle AliExpress orange accent, WHERE USED: Home screen when recent products list is empty
4. **guide-hero.png** - Minimalist illustration showing phone with link input concept, WHERE USED: Top of App Guide screen
5. **avatar-placeholder.png** - Simple circular placeholder in neutral color (for future user profiles), WHERE USED: Potential future feature

**Style for illustrations**: Flat design with subtle gradients, using Primary and Accent colors, simple geometric shapes, NO emojis or complex details.

---

**Implementation Note**: All API keys must be stored using Android Keystore system, never hardcoded. Share functionality uses Android's native share sheet (Intent.ACTION_SEND). Social media icons open respective URLs in external browser.