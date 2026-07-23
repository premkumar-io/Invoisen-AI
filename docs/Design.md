---
name: Invoisen
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#0060ac'
  on-secondary: '#ffffff'
  secondary-container: '#64a8fe'
  on-secondary-container: '#003c70'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#a4c9ff'
  on-secondary-fixed: '#001c39'
  on-secondary-fixed-variant: '#004883'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
  headline-xl-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

# Design.md

# INVOISEN Design System

> Unified design specification for the INVOISEN AI-powered Invoice Generator SaaS.

## Design Vision

Create a premium SaaS experience inspired by Apple's simplicity, Linear's precision, Stripe's professionalism, Vercel's minimalism, Framer's motion, Notion's clarity, and modern AI interfaces. 

Core principles:
- **Minimalist Luxury**: High-end aesthetic through generous whitespace and precise typography.
- **Intelligent Motion**: Framer-style transitions and interactive 3D elements.
- **Adaptive Identity**: One system, three distinct thematic experiences (Light, Dark, AI Purple).
- **Pill-Shaped Fluidity**: A friendly yet premium feel through very high corner radii and smooth shadows.

---

# Adaptive Theme System

A single component system supports three themes without changing layouts. Use CSS variables to drive all colors.

## ☀️ Light Theme (Default)
- **Background**: `#FAF8FF` / `#FFFFFF`
- **Surface**: `#FAF8FF`
- **Primary**: `#004AC6` (Royal Blue)
- **Secondary**: `#0060AC`
- **Accent**: `#2563EB`
- **Text Primary**: `#191B23`
- **Text Secondary**: `#434655`
- **Border**: `#C3C6D7`
- **Shadow**: `0 4px 20px -2px rgba(0, 0, 0, 0.05)`

**Style**: Soft shadows, highly rounded white cards, crisp professional appearance.

## 🌙 Dark Theme
- **Background**: `#020617` (Deep Navy/Black)
- **Surface**: `#0F172A` (Navy)
- **Card**: `rgba(30, 41, 59, 0.7)` (Frosted Glass)
- **Primary**: `#3B82F6` (Electric Blue)
- **Text Primary**: `#F8FAFC`
- **Text Secondary**: `#94A3B8`
- **Border**: `rgba(255, 255, 255, 0.1)`
- **Glow**: `rgba(59, 130, 246, 0.15)`

**Style**: Glassmorphism, highly rounded frosted cards, premium developer aesthetic, subtle blue ambient glow.

## ✨ Purple AI Theme
- **Background**: Purple Mesh Gradient (Deep Violet to Lavender)
- **Surface**: `rgba(255, 255, 255, 0.1)` (Ultra-clear glass)
- **Primary**: `#7C3AED` (Vivid Purple)
- **Secondary**: `#C084FC`
- **Text Primary**: `#FFFFFF`
- **Accent**: Aurora Lighting (Pink/Purple/Cyan)

**Style**: Aurora gradients, glassmorphism, ambient glow, floating particles, futuristic AI-first interface with pill-shaped components.

---

# Typography

- **Font Family**: `Inter` (UI), `Manrope` (Headings)
- **Scale**:
  - **H1**: 48px / 700 (Tracking -0.02em)
  - **H2**: 40px / 700
  - **H3**: 32px / 600
  - **H4**: 24px / 600
  - **Body**: 16px / 400
  - **Small**: 14px / 500

---

# Spacing & Layout
- **Grid**: 8px base unit.
- **Radius**: `16px` (Standard elements), `32px` (Large cards/containers), `9999px` (Pills/Buttons).
- **Container**: Max-width `1280px` for dashboard content.

---

# Components

## Glass Cards
- **Blur**: `12px` backdrop-blur.
- **Border**: `1px solid rgba(255, 255, 255, 0.1)` (adaptive).
- **Shape**: High corner radius (32px+) for a modern, fluid feel.
- **Hover**: Subtle lift (y-2) and increase in border opacity.

## AI Buttons
- **Primary**: Pill-shaped solid color with a subtle inner glow.
- **AI-Special**: Animated gradient border or "shimmer" effect on a fully rounded pill.

## 3D & Motion
- **Floating Effect**: `animate-float` for 3D elements.
- **Page Transitions**: Smooth fade and slide-up for content.
- **Hover Transitions**: `duration-300 ease-out`.

---

# Design Rules
1. **Consistency**: Use the same component props across all themes.
2. **Glassmorphism**: Use backdrop filters for all overlays and cards in Dark and AI modes.
3. **Pill-First Strategy**: Prioritize high roundedness (Level 3) for all interactive and container elements.
4. **Accessibility**: Maintain AA contrast even in complex gradient backgrounds.
5. **Originality**: No generic dashboard layouts. Use perspective shifts and layered depth.
