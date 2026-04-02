# iExec Nox Hackathon — Developer Feedback

**Project:** ShadowSwap — Confidential OTC Trading Desk
**Stack:** Next.js 14, wagmi v2, Solidity 0.8.28, Arbitrum Sepolia
**Date:** April 2026

---

## Overall Impression

Nox is solving a genuinely important problem. Encrypted on-chain computation is the missing primitive that makes serious DeFi use cases — like hiding order sizes from MEV bots — actually feasible. The ERC-7984 standard is well-conceived, and once everything clicks, the programming model (encrypted handles, ACL-based access) feels surprisingly elegant. That said, the path from "I want to build with Nox" to "I have a working app" had more friction than it needed to.

---

## What Was Easy

**The Solidity primitives are intuitive once you understand the mental model.** `Nox.fromExternal()`, `Nox.safeSub()`, `Nox.select()` — these read almost like pseudocode. The decision to use `safeSub` + `select` instead of `require()` to avoid leaking information through reverts is clever and well-designed. After reading it once, the pattern sticks.

**`ERC20ToERC7984Wrapper` is a great abstraction.** Wrapping an existing ERC-20 into a confidential token took about 10 lines of Solidity. That's the right level of abstraction — it removes boilerplate without hiding anything important.

---

## What Was Challenging

**The JS SDK (`@iexec-nox/handle`) documentation is thin.** The core flow — `createViemHandleClient` → `encryptInput` → pass `handle` + `inputProof` to contract — is documented, but edge cases are not. Questions that took significant time to answer:
- What happens if the wallet client isn't initialized when you call `encryptInput`?
- What's the exact type expected by `fromExternal` on the Solidity side — `bytes32` or a custom type?
- How do you decrypt a handle if you're the ACL-permitted address?

A single end-to-end code example covering the full encrypt → submit → decrypt cycle would save hours.

**`Nox.allowThis()` + `Nox.allow()` discipline is easy to get wrong.** Every intermediate encrypted value needs both calls, or downstream operations silently fail. There's no compile-time enforcement and no helpful revert message when you miss one — the transaction just fails or produces unexpected results. A linting rule or a Hardhat plugin that warns about unallowed handles would be a significant quality-of-life improvement.

**Network setup friction for new builders.** Arbitrum Sepolia is the right choice for a fast, low-cost testnet, but the ecosystem around it for new developers is rough. Public RPCs are unreliable, faucets are scattered and inconsistent, and MetaMask's default fee estimation produces "max fee below base fee" errors due to stale data. None of this is iExec's fault directly, but better documentation or a recommended RPC/faucet setup guide specific to Nox developers would prevent a lot of wasted time.

---

## Suggestions for Improvement

1. **End-to-end JS example** — a single repo showing `encryptInput` on the frontend, `fromExternal` in the contract, and `decrypt` on the frontend after an ACL grant. This is the full developer journey and it's currently not in one place.

2. **Revert messages for ACL violations** — when a contract tries to operate on a handle it hasn't been allowed on, the error should say so explicitly rather than producing a generic failure.

3. **Hardhat plugin or test helper** — a utility like `nox.debug.decryptForTest(handle)` in local test environments would make unit testing encrypted contract logic dramatically easier.

4. **Recommended RPC list** — a short note in the docs recommending reliable RPC endpoints for Arbitrum Sepolia would prevent the "max fee below base fee" issue that blocked several builders.

5. **`ERC7984` transfer event** — it would be helpful to have an event emitted on confidential transfers (with encrypted amounts, even if opaque) so frontends can trigger refetches without polling.

---

## Summary

| Area | Rating |
|---|---|
| Core concept | ★★★★★ |
| Solidity SDK | ★★★★☆ |
| JS SDK | ★★★☆☆ |
| Documentation | ★★★☆☆ |
| Testnet experience | ★★☆☆☆ |
| Error messages | ★★☆☆☆ |

Nox has real potential to become the default confidentiality layer for EVM DeFi. The primitives are sound, the standard is well-designed, and the use case is clear. Investing in developer experience — specifically the JS SDK docs, better error messages, and testing utilities — would lower the barrier from "interesting technology" to "thing I reach for by default."

---

*Submitted as part of the iExec Nox Hackathon, April 2026.*
