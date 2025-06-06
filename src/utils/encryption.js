const { ed25519 } = require("@noble/ed25519");
const { sha256 } = require("@noble/hashes/sha256");

// Helper functions for base64 operations using Node's Buffer
const bytesToBase64 = (bytes) => Buffer.from(bytes).toString("base64");
const base64ToBytes = (base64) => Buffer.from(base64, "base64");

/**
 * Encrypt a message using GitHub's public key
 * @param {string} message - Message to encrypt
 * @param {string} publicKey - Base64 encoded public key
 * @returns {Promise<{encrypted: string, keyId: string}>} Encrypted message and key ID
 */
async function encryptMessage(message, publicKey) {
  try {
    // Convert message to bytes
    const messageBytes = new TextEncoder().encode(message);

    // Convert public key from base64 to bytes
    const publicKeyBytes = base64ToBytes(publicKey);

    // Generate ephemeral key pair
    const ephemeralPrivateKey = ed25519.utils.randomPrivateKey();
    const ephemeralPublicKey = await ed25519.getPublicKey(ephemeralPrivateKey);

    // Derive shared secret
    const sharedSecret = await ed25519.getSharedSecret(
      ephemeralPrivateKey,
      publicKeyBytes
    );

    // Hash shared secret for encryption key
    const encryptionKey = sha256(sharedSecret);

    // Encrypt message using shared secret
    const encryptedMessage = new Uint8Array(messageBytes.length);
    for (let i = 0; i < messageBytes.length; i++) {
      encryptedMessage[i] =
        messageBytes[i] ^ encryptionKey[i % encryptionKey.length];
    }

    // Combine ephemeral public key and encrypted message
    const combined = new Uint8Array(
      ephemeralPublicKey.length + encryptedMessage.length
    );
    combined.set(ephemeralPublicKey);
    combined.set(encryptedMessage, ephemeralPublicKey.length);

    return {
      encrypted: bytesToBase64(combined),
      keyId: bytesToBase64(ephemeralPublicKey),
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

module.exports = {
  encryptMessage,
};
