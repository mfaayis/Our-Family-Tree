# Fluid Animations and Deployment Plan

You requested the website to be highly fluid with top-tier animations, as well as a domain and deployment setup so you don't have to manage the infrastructure manually. 

## User Review Required

> [!IMPORTANT]
> **Authentication and Domains require your identity/payment:**
> I cannot securely create an account, verify an email, or purchase a `.com` domain on your behalf because these require your personal credentials, email verification, and credit card. 
> 
> However, I can set up the infrastructure so it is a **1-click process** for you. I propose deploying the app to **Vercel** (which will give you a free `your-family-tree.vercel.app` domain instantly). 
> For the database, you will still need to sign in with Google to create a free Firebase project.

## Open Questions

> [!WARNING]
> **Custom Domain vs Free Domain**
> Do you want to purchase a custom domain (e.g., `kassimpillaifamily.com`), or is a free `vercel.app` domain sufficient for now? (If you want a custom domain, I will guide you on where to buy it and I will configure the DNS settings for you).

## Proposed Changes

### 1. Fluid Animations & UI/UX Polish
I will install `framer-motion` to elevate the UI to a premium, highly fluid experience.

#### [NEW] [animation-utils.ts](file:///c:/Users/user/Downloads/our-family-tree/src/lib/animations.ts)
- Create reusable Framer Motion variants for page transitions, stagger effects, and smooth popovers.

#### [MODIFY] [LandingPage.tsx](file:///c:/Users/user/Downloads/our-family-tree/src/components/landing/LandingPage.tsx)
- Add scroll-linked animations, floating elements, and a stagger reveal for the hero section to create a "wow" factor upon entry.

#### [MODIFY] [FamilyTreePage.tsx](file:///c:/Users/user/Downloads/our-family-tree/src/components/tree/FamilyTreePage.tsx)
- Implement layout animations (`layout` prop in Framer Motion) so that when the tree expands/collapses or the user switches branches, the nodes glide smoothly to their new positions instead of snapping.

#### [MODIFY] UI Components (`Dialog`, `Card`, `PersonCard`)
- Add spring animations to dialogs so they bounce in naturally.
- Add micro-interactions to buttons and person cards (e.g., slight scale up on hover, tap depression).

### 2. Infrastructure & Deployment
I will prepare the project for a seamless 1-click deployment.

#### [NEW] [vercel.json](file:///c:/Users/user/Downloads/our-family-tree/vercel.json)
- Configure deployment settings for Vercel.

## Verification Plan

### Manual Verification
- Start the local dev server and verify that page transitions and tree layout animations are buttery smooth (60fps).
- Run the Vercel CLI deployment command, which will prompt you to quickly log in and automatically push the site live to the internet.
