import fs from "fs"; // Filesystem
import path from "path"; // Path
import keccak256 from "keccak256"; // Keccak256 hashing
import MerkleTree from "merkletreejs"; // MerkleTree.js
import { logger } from "./utils/logger"; // Logging
import { getAddress, parseUnits, solidityKeccak256 } from "ethers/lib/utils"; // Ethers utils
import { BigNumber } from "ethers" // BN Math

// Output file path
const outputPath: string = path.join(__dirname, "../merkle.json");

// Airdrop recipient addresses and scaled token values
type AirdropRecipient = {
  // Recipient address
  address: string;
  // Scaled-to-decimals token value
  value: string;
};

export default class Generator {
  // Airdrop recipients
  recipients: AirdropRecipient[] = [];

  /**
   * Setup generator
   * @param {number} decimals of token
   * @param {Record<string, number>} airdrop address to token claim mapping
   */
  constructor(decimals: number, airdrop: Record<string, number>) {
    // For each airdrop entry
    for (const [address, tokens] of Object.entries(airdrop)) {
      // Push:
      this.recipients.push({
        // Checksum address
        address: getAddress(address),
        // Scaled number of tokens claimable by recipient
        value: parseUnits(tokens.toString(), decimals).toString()
      });
    }
  }

  /**
   * Generate Merkle Tree leaf from address and value
   * @param {string} address of airdrop claimee
   * @param {string} value of airdrop tokens to claimee
   * @returns {Buffer} Merkle Tree node
   */
  generateLeaf(address: string, value: string): Buffer {
    return Buffer.from(
      // Hash in appropriate Merkle format
      solidityKeccak256(["address", "uint256"], [address, value]).slice(2),
      "hex"
    );
  }

  async process(): Promise<void> {
    logger.info("Generating Merkle tree.");

    // Generate merkle tree
    const merkleTree = new MerkleTree(
      // Generate leafs
      this.recipients.map(({ address, value }) =>
        this.generateLeaf(address, value)
      ),
      // Hashing function
      keccak256,
      { sortPairs: true }
    );

    // Collect and log merkle root
    const merkleRoot: string = merkleTree.getHexRoot();
    logger.info(`Generated Merkle root: ${merkleRoot}`);

    // define user type for merkle.json
    type user = {
        address: string;
        amount: string;
        proofs: string[];
    }


    // initiate variables for merkle.json
    let airdrops: user[] = []
    let totalAmount: BigNumber = BigNumber.from("0")

    // generate user data and calcualte total amount for airdrop
    this.recipients.forEach(element => {
        const leaf: Buffer = this.generateLeaf(element.address, element.value);
        let user: user = {address: element.address, amount: element.value, proofs: merkleTree.getHexProof(leaf)}
        airdrops.push(user)
        totalAmount = totalAmount.add(BigNumber.from(element.value))
    });
    

    // Collect and save merkle tree + root
    await fs.writeFileSync(
      // Output to merkle.json
      outputPath,
      // Root + total amount + user proofs/amount
      JSON.stringify({
        root: merkleRoot,
        total: totalAmount.toString(),
        airdrops: airdrops
      })
    );
    logger.info("Generated merkle tree and root saved to Merkle.json.");
  }
}
