# Local Blockchain (dev)

Runs all Web3 workflows — reads **and** writes (send ETH, ERC‑20 transfer, contract
calls) — against a local node with funded test accounts, so nothing needs real
mainnet/testnet funds.

## Stack
- **Ganache** — local EVM at `http://127.0.0.1:8545`, chainId **31337**, 10 accounts
  pre‑funded with 1000 ETH (deterministic, so addresses/keys are always the same).
- **DemoToken (DEMO)** — a minimal ERC‑20 deployed on start; 1,000,000 minted to the
  deployer (account #0), 1,000 sent to account #1.
- Addresses + keys for the current run are written to `local-chain.json`.

## Run it
In one terminal, start the chain and keep it running:

```bash
npm run chain
```

Then, once (or after each restart of the chain), deploy the token and wire the
workflows to it:

```bash
npm run chain:setup
```

Start the app as usual (`npm run dev`). The Web3 nodes use the local chain when their
`chain` property is `local` (also accepts `localhost` / `hardhat` / `ganache` / `anvil`).

## What's wired up
- Existing balance / token workflows are re‑pointed to the local chain + DEMO token.
- Two write demos are created: **Local: Send ETH** and **Local: ERC‑20 Transfer**.
- In the builder, set a Web3 node's **chain** to `local` to target this node. Leave
  **rpcUrl** blank and it defaults to `http://127.0.0.1:8545`.

## Notes
- The chain is in‑memory: stopping `npm run chain` resets state. Re‑run
  `npm run chain:setup` after restarting it (the token address is rewritten into
  `local-chain.json` and the workflows).
- Solidity is compiled targeting the **paris** EVM for compatibility with Ganache 7.x
  (newer EVM versions emit `PUSH0`/`MCOPY`, which the local node rejects).
