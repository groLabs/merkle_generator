# Merkle Proof Generator

Given a `decimals` count for a token and list of airdrop recipients, outputs:

1. A merkle root for use in a Merkle tree verification in smart contracts.
2. A merkle tree for use in a front-end / or merkle proofs per user for Smart contract inputs

## Run locally

```bash
# Navigate to generator directory, if not already there
cd merkle_generator/

# Install dependencies
npm install

# Edit config.json
vim config.json

# Run script
npm run start
```

Outputs a `merkle.json`, in the following format if generator file used:

```json
{
  "root": "0x6a0b89fc219e9e72ad683e00d9c152532ec8e5c559600e04160d310936400a00",
  "tree": {
    "duplicateOdd": false,
    "hashLeaves": false,
    "isBitcoinTree": false,
    "leaves": [
      ...
    ],
    "layers": [
      [...],
      [...]
    ],
    "sortLeaves": false,
    "sortPairs": true,
    "sort": false,
    "fillDefaultHash": null
  }
}
```

Outputs a `merkle.json`, in the following format if generatorProofs file used:

```json
{
  "root": "0x6a0b89fc219e9e72ad683e00d9c152532ec8e5c559600e04160d310936400a00",
  "airdrops": [{
    "address": "0x022Ce4715b44EF6F0eAd8561B29dA676928D16f3",
    "amount": "74221418360000000000",
    "proofs": [...],
  },
  {
    "address": "0x02A4496aFD423B2B36a34D7F6E918e71Ca88898B",
    "amount": "233915023500000000000",
    "proofs": [...],
  }]
}
```

## Credits
Adapted from https://github.com/Anish-Agnihotri/merkle-airdrop-starter
