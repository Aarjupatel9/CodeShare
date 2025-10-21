/**
 * Test Fixtures
 * Sample data for testing
 */

const sharp = require('sharp');
const path = require('path');

class Fixtures {
  /**
   * Sample user data
   */
  getSampleUser(overrides = {}) {
    return {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      ...overrides,
    };
  }

  /**
   * Sample auction data
   */
  getSampleAuction(overrides = {}) {
    return {
      name: 'IPL 2025',
      organizer: 'BCCI',
      password: 'ipl2025',
      budgetPerTeam: 100000000,
      maxTeamMember: 15,
      minTeamMember: 11,
      ...overrides,
    };
  }

  /**
   * Sample team data
   */
  getSampleTeam(auctionId, overrides = {}) {
    return {
      name: 'Mumbai Indians',
      owner: 'Mukesh Ambani',
      auction: auctionId,
      budget: 100000000,
      remainingBudget: 100000000,
      ...overrides,
    };
  }

  /**
   * Sample player data
   */
  getSamplePlayer(auctionId, overrides = {}) {
    return {
      name: 'Rohit Sharma',
      playerNumber: 'P001',
      role: 'Batsman',
      basePrice: 200000000,
      auction: auctionId,
      battingHand: 'Right',
      bowlingHand: 'Right',
      category: 'A',
      ...overrides,
    };
  }

  /**
   * Sample set data
   */
  getSampleSet(auctionId, overrides = {}) {
    return {
      name: 'Set 1',
      auction: auctionId,
      state: 'idle',
      ...overrides,
    };
  }

  /**
   * Sample document data
   */
  getSampleDocument(overrides = {}) {
    return {
      unique_name: `test-doc-${Date.now()}`,
      data: '<p>This is a test document</p>',
      access: 'private',
      ...overrides,
    };
  }

  /**
   * Generate test image buffer
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @param {string} color - Background color
   * @returns {Promise<Buffer>} - Image buffer
   */
  async generateTestImage(width = 200, height = 200, color = 'blue') {
    try {
      const svg = `
        <svg width="${width}" height="${height}">
          <rect width="${width}" height="${height}" fill="${color}"/>
          <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="40">TEST</text>
        </svg>
      `;

      const buffer = await sharp(Buffer.from(svg))
        .png()
        .toBuffer();

      return buffer;
    } catch (error) {
      console.error('Error generating test image:', error);
      throw error;
    }
  }

  /**
   * Generate large test image (for testing size limits)
   * Creates a complex gradient image that cannot be compressed below 50KB
   */
  async generateLargeTestImage() {
    // Create a complex image with lots of detail that resists compression
    const width = 2000;
    const height = 2000;
    
    // Generate random noise buffer (hard to compress)
    const pixelCount = width * height * 4; // RGBA
    const noiseBuffer = Buffer.alloc(pixelCount);
    
    for (let i = 0; i < pixelCount; i++) {
      noiseBuffer[i] = Math.floor(Math.random() * 256);
    }

    const buffer = await sharp(noiseBuffer, {
      raw: {
        width,
        height,
        channels: 4
      }
    })
      .png({ compressionLevel: 0 }) // No compression
      .toBuffer();

    return buffer;
  }

  /**
   * Sample player import data (Excel format)
   */
  getSamplePlayerImportData(auctionId) {
    return {
      main: [
        {
          "PLAYER NO.": "P001",
          "PLAYER NAME": "Virat Kohli",
          "ROLE": "Batsman",
          "BASE PRICE": "2",
          "BATTING HAND": "Right",
          "BOWLING ARM": "Right",
          "CATEGORY": "A",
          "PREFFERED SET": "Set 1"
        },
        {
          "PLAYER NO.": "P002",
          "PLAYER NAME": "Jasprit Bumrah",
          "ROLE": "Bowler",
          "BASE PRICE": "2",
          "BATTING HAND": "Right",
          "BOWLING ARM": "Right",
          "BOWLING TYPE": "Fast",
          "CATEGORY": "A",
          "PREFFERED SET": "Set 1"
        }
      ]
    };
  }
}

module.exports = new Fixtures();

