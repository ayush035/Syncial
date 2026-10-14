# Syncial

### Where conversation meets conviction.

Syncial is a social prediction platform that brings on-chain identity, a community feed and crypto prediction markets into one experience. People can claim a username, publish posts, follow others, create questions about asset prices and back their judgment with USDC.

The aim is simple: give communities a place where thoughtful questions create value, participation has a visible record, and creators share in the activity they bring together.

[Public repository](https://github.com/ayush035/Syncial)

## Vision

Every age has had its public square: a place where people gather, speak and test one another's judgment. The internet gave us the crowd, but too often left conviction without a record and attention without accountability.

Syncial seeks to bring the two together. It is a place where people can speak, stand behind a prediction and build trust through what follows. A question becomes an invitation to participate; a prediction becomes a record that others can examine.

We believe that those who gather a community should share in the value they create, and that a voice should earn its standing through judgment rather than noise. With Arc as its intended foundation and USDC at its centre, Syncial aims to make identity, conversation and participation part of the same public square.

Our ambition is to make the most trusted voice in a community the one that has earned it.

## Why Syncial

Social platforms are good at gathering opinions. Prediction platforms are good at turning expectations into positions. Syncial brings these experiences together so that a community can move from a conversation to a question, and from a question to a stake.

- **For participants:** discover people and markets, express a view, and track participation through a wallet-linked identity.
- **For creators:** host prediction markets and earn a share of qualifying settled pools.
- **For communities:** build a shared record of questions, positions and outcomes instead of relying on likes alone.

## What you can do

### Claim an on-chain username

Register an available handle against a wallet. The username contract records the relationship between a name and its owner, with one username per wallet.

### Publish and discover posts

Upload an image through the Lighthouse integration and record its reference on-chain. Browse the public feed, manage your own posts, mark posts as deleted and change their privacy flag.

> A privacy flag is not encryption. On-chain post records and public image references should not be treated as confidential storage.

### Follow a community

Find people by username and use the social graph integration to follow or unfollow them. The dashboard brings identity, posts and follower information together.

### Create and join prediction markets

Create binary price-target markets, select an asset price feed and a duration, then take a Yes or No position. The prediction contract contains USDC staking paths, pooled rewards and creator/platform fee logic.

## Arc and USDC

Arc is an EVM-compatible Layer 1 designed for stablecoin-native applications, with USDC as its gas token.

Syncial's builder describes the app as using USDC on Arc throughout the experience, including username minting, marketplace and market creation, posting, and prediction participation.

The current public source now reflects that direction:

- The wallet provider selects the repository's Arc chain configuration.
- Identity, post and social-graph actions are wired to contract calls.
- Prediction positions can use ERC-20 USDC or a native payable staking path.
- Prediction payouts and fees are denominated in USDC in the contract design.

**Gas and stakes are different.** Username minting, posting and market creation are nonpayable functions in the checked source. Their intended USDC use is transaction gas, not a separate USDC payment required by those functions. Prediction participation additionally commits a stake.

### Deployment evidence

The code configuration is not, by itself, proof of a successful deployment. Complete these fields with the final deployment used for the submission:

| Item | Submission details |
| --- | --- |
| Live application URL | FILL IN |
| Public repository | https://github.com/ayush035/Syncial |
| Deployed network and chain ID | FILL IN: confirm against the actual network |
| UsernameMinting (Identity) | `0x0Eb52b91AaEdac88F7f7fCE6FAa7a6B4B4AA952C`<br>Deployment tx: `0x9c7439a325d79beede0f94488365ccd71b978faac21bdf64d521031e8c4cb5bd` |
| SocialPosts (Feed and Privacy) | `0x24D3e95A1d27ff796FbF8a8cD3121f220F0b8C26`<br>Deployment tx: `0x6e23497da8122a723b649d37a6fcc7808a582a5c0f742fa2ed304a0dc3bb5750` |
| Social graph contract and explorer link | FILL IN |
| ArcPredictionMarketplace (USDC-native) | `0xCB35bbf1a3633161092bD324383E9667bAb529C9`<br>Deployment tx: `0x469a16fbc06aa21d7c1551b35edfa80a38df112d1827dbfb7296f58a5f4be747` |
| Example successful transaction | Any deployment tx above; add a user-action tx (post, mint, stake) if available |
| Demo video or walkthrough | FILL IN |

Confirm the deployed bytecode, configured addresses, USDC denomination and oracle integration against the chosen network before presenting them as live.

## Prediction market mechanics

The current `Prediction.sol` implements a binary, pari-mutuel price-target model:

1. A creator supplies a question, asset price-feed ID, target price and duration.
2. Participants stake on Yes or No before the market closes.
3. Calls to `updateMaxPrice` record a higher price reported by the configured Pyth interface while the market is active.
4. After expiry, `resolvePoll` compares the highest recorded price with the target.
5. Qualifying pools distribute the remainder proportionally to winning stakes after fees. Pools with too little volume on either side follow the refund path.

Current source parameters:

| Parameter | Value |
| --- | --- |
| Creator fee | 2% of the total qualifying settled pool |
| Platform fee | 1% of the total qualifying settled pool |
| Minimum share on each side | 4% of the total pool; otherwise refund |
| Minimum market duration | 5 minutes |
| ERC-20 stake minimum | 1 USDC in the contract's six-decimal accounting |

These describe the checked source, not an independently verified deployed contract. Price observation requires update calls; the contract does not continuously observe every market price on its own. Deployed oracle availability, price scaling and update behaviour must be checked for the chosen network.

## Try the experience

1. Open the live app at **FILL IN**.
2. Connect a compatible wallet to the confirmed deployment network.
3. Have enough USDC for transaction gas and, if participating in predictions, the intended stake.
4. Claim an available username.
5. Publish a post or find people in the public feed.
6. Open the prediction page to create a market or join an active one.
7. Review the question, target, expiry and transaction details before signing.

## Run locally

The frontend lives in a nested application directory:

```bash
git clone https://github.com/ayush035/Syncial.git
cd Syncial/app.syncial/app.syncial
npm install
npm run dev
```

Open the local URL printed by Next.js.

For a production build:

```bash
npm run build
npm run start
```

For image uploads, configure your own Lighthouse integration in `.env.local`:

```dotenv
NEXT_PUBLIC_LIGHTHOUSE_API_KEY=YOUR_LIGHTHOUSE_API_KEY
```

`NEXT_PUBLIC_` values are exposed to the browser. Do not put private credentials in them. Review upload-service permissions and use an appropriate backend flow for any secret that must stay private.

Wallet connection settings, contract addresses, chain definitions and price feeds are currently configured in source. Update and validate them for your deployment rather than assuming the checked-in values are correct.

## Stack

- **Frontend:** Next.js 15, React 19 and Tailwind CSS 4.
- **Wallets and contract calls:** RainbowKit, wagmi, viem and ethers.
- **Contracts:** Solidity with OpenZeppelin helpers in the prediction marketplace.
- **Market data:** Pyth integration with additional frontend price-display fallback logic.
- **Image uploads:** Lighthouse integration.

## Repository structure

```text
Syncial/
├── README.md
├── LICENSE
└── app.syncial/app.syncial/
    ├── pages/          # Home, discover, dashboard and predictions
    ├── components/     # Identity, posts, uploads and social UI
    ├── hooks/          # Wallet and contract integration
    ├── contracts/      # Username, posts and prediction Solidity source
    ├── lib/            # Chain settings, addresses, ABIs and USDC helpers
    ├── abi/            # Additional contract interfaces
    ├── public/         # Images and static assets
    ├── styles/         # Global styling
    └── package.json
```

## Build status and scope

This README describes the Arc/USDC-oriented public source checked on 15 October 2026 and the builder's stated product direction. The former Sepolia onboarding README has been replaced here with documentation for the current source.

Deployment evidence remains to be filled in above. This documentation does not claim a completed security audit, tested production payouts, guaranteed returns or verified network compatibility. Prediction stakes can be lost. Review and test contracts before committing funds.

Reputation based on a history of judgment is the long-term vision, not a claim that a reputation scoring system is already implemented.

## License

This repository is released under the [MIT License](LICENSE).
