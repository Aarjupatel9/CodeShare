#!/usr/bin/env node

/**
 * Team Logo Cache Cleanup Script
 * 
 * Removes cached team logos that haven't been accessed in 30+ days
 * Run this script manually or via cron job
 * 
 * Usage:
 *   node scripts/cleanup-team-logos.js
 * 
 * Cron job (run daily at 2 AM):
 *   0 2 * * * cd /path/to/backend && node scripts/cleanup-team-logos.js
 */

const fs = require('fs').promises;
const path = require('path');

const PUBLIC_LOGOS_DIR = path.join(__dirname, '../public/team-logos');
const DAYS_TO_KEEP = process.env.LOGO_CACHE_DAYS || 30;

async function cleanupOldLogos() {
  try {
    console.log('🧹 Starting team logo cache cleanup...');
    console.log(`📁 Directory: ${PUBLIC_LOGOS_DIR}`);
    console.log(`⏰ Removing files older than ${DAYS_TO_KEEP} days`);

    const files = await fs.readdir(PUBLIC_LOGOS_DIR);
    const cutoffDate = Date.now() - (DAYS_TO_KEEP * 24 * 60 * 60 * 1000);
    
    let cleaned = 0;
    let kept = 0;
    let totalSize = 0;
    
    for (const file of files) {
      // Skip .gitkeep and other hidden files
      if (file.startsWith('.')) {
        continue;
      }

      const filepath = path.join(PUBLIC_LOGOS_DIR, file);
      
      try {
        const stats = await fs.stat(filepath);
        totalSize += stats.size;
        
        if (stats.mtimeMs < cutoffDate) {
          await fs.unlink(filepath);
          cleaned++;
          console.log(`  ❌ Deleted: ${file} (${Math.round(stats.size / 1024)}KB, last accessed: ${new Date(stats.mtime).toLocaleDateString()})`);
        } else {
          kept++;
        }
      } catch (err) {
        console.error(`  ⚠️  Error processing ${file}:`, err.message);
      }
    }
    
    console.log('\n📊 Cleanup Summary:');
    console.log(`  ✅ Kept: ${kept} files`);
    console.log(`  ❌ Deleted: ${cleaned} files`);
    console.log(`  💾 Total cache size: ${Math.round(totalSize / 1024)}KB`);
    console.log('\n✅ Cleanup completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Run cleanup
cleanupOldLogos();

