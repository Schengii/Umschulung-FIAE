# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.3.x   | :white_check_mark: |
| < 0.3.0 | :x:                |

---

## Reporting a Vulnerability

If you discover a potential security vulnerability within the Minecraft C++ Engine (particularly in the UDP `NetworkManager`, Anvil save parser, or memory allocations), please report it responsibly:

1. **Do not create public GitHub issues** for critical security exploits.
2. Email the maintainer or submit a private security advisory via GitHub Security Advisories.
3. Include:
   - Reproduction steps or proof of concept packet sequence.
   - Operating system and compiler version.
   - Potential impact (e.g., Denial of Service, buffer overflow, arbitrary memory write).

---

## Network & Memory Safety Invariants

- **Packet Validation**: All incoming UDP datagrams require an envelope with a valid 64-bit session token generated from OS entropy. Packets with invalid tokens or out-of-order sequence counters are dropped.
- **World Save Bounds**: Sector offsets in `.mca` files are strictly bounded to prevent out-of-bounds file reads.

---

## Automated Secret & Credential Leak Prevention

The repository enforces a Git pre-commit hook in `.githooks/pre-commit`:
- Rejects any staged `.env` files (except `.env.example`).
- Scans git diffs against known secret patterns (Anthropic, OpenAI, GitHub tokens, AWS credentials, private keys).
- Activated locally via:
  ```powershell
  git config core.hooksPath .githooks
  ```
