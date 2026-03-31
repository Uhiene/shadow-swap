# CLAUDE.md — ShadowSwap Master Instructions

> Save this file as `CLAUDE.md` in the ROOT of your project folder (e.g. `shadowswap/CLAUDE.md`).
> Every prompt you give Claude Code should start with: **"Read CLAUDE.md first, then..."**

---

## Rules

- NEVER ask me technical questions. Make the best decision yourself. Only ask me questions about what I want the app to DO — never about how to build it.
- NEVER give me code snippets or partial files. Always give me the COMPLETE file I can save and run. Every single time.
- NEVER say "you can add this later" or "as an exercise." Build it now, build it complete.
- NEVER explain code unless I specifically ask. Just give me the files.
- When I paste an error, fix it and give me the COMPLETE updated file. Don't give me a patch or diff — give me the whole file with the fix applied.
- If an approach fails 3 times, abandon it completely and use a different approach. Tell me what you're changing and why in ONE sentence.
- Use TypeScript for all frontend code, Solidity for contracts.
- Every file you create must be production-ready — with error handling, loading states, and edge cases covered.
- I am a copy-paste developer. I do NOT write code. I copy your output, save files, and run commands. That's it.

---

## THE PROJECT

**Name:** ShadowSwap
**Tagline:** "Trade Large. Stay Hidden."
**What it is:** A decentralized confidential OTC (Over-The-Counter) trading desk where crypto whales can buy and sell large amounts of tokens without anyone seeing their order sizes.
**Problem:** MEV bots front-run large trades on DEXs, costing traders $900M+/year. ShadowSwap hides order sizes using iExec Nox Confidential Tokens so nobody can see or exploit trade sizes.
**Network:** Arbitrum Sepolia (Chain ID: 421614, RPC: https://sepolia-rollup.arbitrum.io/rpc)

---

## TECH STACK (do not deviate)

| Layer | Tool |
|-------|------|
| Frontend Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Wallet Connection | wagmi v2 + viem v2 + @rainbow-me/rainbowkit |
| Nox JS SDK | @iexec-nox/handle |
| Smart Contracts | Solidity 0.8.24 - 0.8.28 |
| Nox Contracts | @iexec-nox/nox-protocol-contracts, @iexec-nox/nox-confidential-contracts |
| Contract Framework | Hardhat |
| Network | Arbitrum Sepolia (421614) |

---

## DESIGN SYSTEM — "CRYSTAL VOID"

### Aesthetic Direction
Deep space purple meets geometric crystals. Playful but premium. Think luxury gaming UI meets DeFi dashboard. NOT generic crypto dark mode. NOT boring fintech.

### Color Palette (use CSS variables)
```css
:root {
  /* Backgrounds */
  --bg-void: #0D0221;           /* deepest background */
  --bg-surface: #1A0A3E;        /* card/panel backgrounds */
  --bg-elevated: #2D1B69;       /* hover states, elevated cards */
  
  /* Primary Purple Spectrum */
  --purple-deep: #4A1FB8;       /* primary actions */
  --purple-bright: #7C3AED;     /* buttons, links */
  --purple-glow: #A78BFA;       /* glowing accents, highlights */
  --purple-soft: #C4B5FD;       /* subtle text, borders */
  
  /* Accent Colors */
  --pink-hot: #EC4899;          /* alerts, important badges */
  --pink-glow: #F472B6;         /* secondary accents */
  --magenta-crystal: #D946EF;   /* special highlights */
  --cyan-accent: #22D3EE;       /* success states, confirmations */
  
  /* Text */
  --text-primary: #F5F3FF;      /* main text - slight purple tint */
  --text-secondary: #A78BFA;    /* secondary text */
  --text-muted: #6D5BA3;        /* muted/disabled text */
  
  /* Effects */
  --glow-purple: 0 0 20px rgba(124, 58, 237, 0.5);
  --glow-pink: 0 0 20px rgba(236, 72, 153, 0.4);
  --glow-cyan: 0 0 15px rgba(34, 211, 238, 0.4);
  
  /* Gradients */
  --gradient-crystal: linear-gradient(135deg, #4A1FB8 0%, #7C3AED 30%, #D946EF 70%, #EC4899 100%);
  --gradient-surface: linear-gradient(180deg, #1A0A3E 0%, #0D0221 100%);
  --gradient-button: linear-gradient(135deg, #7C3AED 0%, #D946EF 100%);
}
```

### Typography
- **Display/Headings:** "Clash Display" from Fontshare (or "Syne" from Google Fonts as fallback)
- **Body:** "General Sans" from Fontshare (or "DM Sans" from Google Fonts as fallback)
- **Monospace (numbers/addresses):** "JetBrains Mono" from Google Fonts
- Import fonts via CDN in layout.tsx

### Visual Effects (apply these everywhere)
- **Glass morphism** on cards: `backdrop-filter: blur(16px); background: rgba(26, 10, 62, 0.7); border: 1px solid rgba(167, 139, 250, 0.15);`
- **Crystal geometric shapes** as decorative SVG backgrounds (triangles, polygons) with purple/pink gradients and low opacity
- **Glow effects** on hover: buttons and cards get a soft purple/pink glow
- **Animated gradient borders** on primary cards
- **Subtle floating particles** or crystal shapes in hero section background
- **Smooth transitions** on everything: `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- **Staggered fade-in animations** on page load

### Component Styling Rules
- **Buttons:** Gradient background (purple→magenta), rounded-xl, glow on hover, scale(1.02) on hover
- **Cards:** Glass morphism, subtle border, rounded-2xl, glow on hover
- **Inputs:** Dark background, purple border on focus, rounded-xl
- **Badges:** Small, rounded-full, gradient or solid color backgrounds
- **The "🔒 Hidden" badge:** Special — animated pulse glow effect, pink/magenta gradient
- **Tables/Lists:** No visible borders, use spacing and subtle background alternation
- **Wallet addresses:** Monospace font, truncated with "0x1234...5678" format
- **Numbers/amounts:** Monospace font, right-aligned

### Layout Rules
- Max width 1280px centered
- Generous padding (p-6 to p-8 on containers)
- Card grid: 1 column mobile, 2 columns tablet, 3 columns desktop
- Navbar: sticky, glass morphism, logo left, nav center, wallet button right
- Footer: minimal, dark

---

## APP STRUCTURE

```
shadowswap/
├── app/
│   ├── layout.tsx          # Root layout with providers, fonts, navbar
│   ├── page.tsx            # Landing page (hero + features + stats)
│   ├── marketplace/
│   │   └── page.tsx        # Browse offers
│   ├── create/
│   │   └── page.tsx        # Create new offer
│   ├── trade/
│   │   └── [id]/
│   │       └── page.tsx    # Accept/take an offer
│   └── dashboard/
│       └── page.tsx        # Your balances, trades, unwrap
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── OfferCard.tsx
│   ├── WrapModal.tsx
│   ├── UnwrapModal.tsx
│   ├── TransactionStatus.tsx
│   ├── CrystalBackground.tsx  # Decorative SVG crystals
│   └── GlowButton.tsx
├── hooks/
│   ├── useNoxHandle.ts     # Encrypt/decrypt via Nox JS SDK
│   ├── useOffers.ts        # Read offers from contract
│   └── useContractWrite.ts # Write to contracts with status
├── lib/
│   ├── contracts.ts        # Deployed contract addresses
│   ├── abi.ts              # Contract ABIs
│   ├── config.ts           # wagmi + chain config
│   └── utils.ts            # Formatters, helpers
├── contracts/
│   ├── WrappedConfidentialToken.sol
│   ├── ShadowSwapOTC.sol
│   └── MockERC20.sol       # Test token for demo
├── scripts/
│   └── deploy.ts
├── public/
│   └── logo.svg
├── hardhat.config.ts
├── tailwind.config.ts
├── package.json
├── .env.local              # NEXT_PUBLIC_* vars + PRIVATE_KEY
├── README.md
└── feedback.md
```

---

## SMART CONTRACT SPECS

### Contract 1: MockERC20.sol
Simple ERC-20 with public mint function for testing. Name: "Shadow USD", Symbol: "sUSD", 18 decimals.

### Contract 2: WrappedConfidentialToken.sol
Inherits `ERC20ToERC7984Wrapper` from `@iexec-nox/nox-confidential-contracts`.
Wraps MockERC20 into confidential ERC-7984. Name: "Confidential Shadow USD", Symbol: "csUSD".

### Contract 3: ShadowSwapOTC.sol
Main contract with:
- `createOffer(sellToken, buyToken, pricePerUnit, externalEuint256 encAmount, bytes proof, uint256 expiry)`
- `takeOffer(uint256 offerId, externalEuint256 encBuyAmount, bytes proof)`
- `cancelOffer(uint256 offerId)`
- `getOfferCount() → uint256`
- `getOffer(uint256 id) → public fields only`
- Reputation: `mapping(address => uint256) public tradeCount`
- Events: OfferCreated, OfferTaken, OfferCancelled

Use Nox primitives: `euint256`, `externalEuint256`, `Nox.fromExternal()`, `Nox.add()`, `Nox.safeSub()`, `Nox.select()`, `Nox.allowThis()`, `Nox.allow()`.

---

## NOX INTEGRATION REFERENCE

### Solidity Imports
```solidity
import {Nox, euint256, externalEuint256} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";
import {ERC7984} from "@iexec-nox/nox-confidential-contracts/contracts/token/ERC7984/ERC7984.sol";
import {ERC20ToERC7984Wrapper} from "@iexec-nox/nox-confidential-contracts/contracts/token/extensions/ERC20ToERC7984Wrapper.sol";
```

### JS SDK Usage (frontend)
```typescript
import { createViemHandleClient } from '@iexec-nox/handle';

// Initialize
const handleClient = await createViemHandleClient(walletClient);

// Encrypt a value
const { handle, inputProof } = await handleClient.encryptInput(amount, contractAddress);

// Decrypt a handle (if ACL allows)
const plaintext = await handleClient.decrypt(handle);
```

### Key Rules
- Every encrypted operation that produces a new handle needs `Nox.allowThis(result)` + `Nox.allow(result, relevantAddress)`
- Transfers never revert on insufficient balance — they silently transfer 0
- Unwrapping is 2 steps: burn (encrypted) → finalize (with decryption proof)
- Use `Nox.safeSub()` + `Nox.select()` instead of `require()` for encrypted comparisons

---

## WHAT "DONE" LOOKS LIKE

A user can:
1. Connect MetaMask wallet on Arbitrum Sepolia
2. Mint test sUSD tokens
3. Wrap sUSD into confidential csUSD
4. Create a sell offer with hidden amount
5. Another user can browse offers and see "🔒 Amount Hidden"
6. Buyer wraps their tokens and takes the offer
7. Trade settles — both parties have confidential tokens
8. Either party can unwrap back to normal tokens
9. Trade count (reputation) increments for both parties

ALL on testnet. NO mock data. NO fake balances. Real transactions on Arbitrum Sepolia.