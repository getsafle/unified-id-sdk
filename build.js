/**
 * @fileoverview UnifiedID SDK Build Script
 * @author kunalmkv
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// ========================================
// BUILD CONFIGURATION
// ========================================

const SRC_DIR = path.join(__dirname, 'src');
const LIB_DIR = path.join(__dirname, 'lib');

// ========================================
// UTILITY FUNCTIONS
// ========================================

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

function copyFile(srcPath, destPath) {
  try {
    fs.copyFileSync(srcPath, destPath);
    console.log(`📄 Copied: ${path.relative(SRC_DIR, srcPath)}`);
  } catch (error) {
    console.error(`❌ Failed to copy ${srcPath}:`, error.message);
  }
}

function copyDirectory(srcDir, destDir) {
  ensureDirectoryExists(destDir);
  
  const items = fs.readdirSync(srcDir);
  
  for (const item of items) {
    const srcPath = path.join(srcDir, item);
    const destPath = path.join(destDir, item);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else if (stat.isFile() && item.endsWith('.js')) {
      copyFile(srcPath, destPath);
    }
  }
}

function cleanDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`🧹 Cleaned directory: ${dirPath}`);
  }
}

// ========================================
// BUILD PROCESS
// ========================================

function build() {
  console.log('🚀 Starting UnifiedID SDK build process...\n');
  
  try {
    // Clean lib directory
    console.log('🧹 Cleaning lib directory...');
    cleanDirectory(LIB_DIR);
    
    // Create lib directory
    console.log('📁 Creating lib directory...');
    ensureDirectoryExists(LIB_DIR);
    
    // Copy source files
    console.log('\n📄 Copying source files...');
    copyDirectory(SRC_DIR, LIB_DIR);
    
    // Copy package.json to lib
    const packageJsonPath = path.join(__dirname, 'package.json');
    const libPackageJsonPath = path.join(LIB_DIR, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      copyFile(packageJsonPath, libPackageJsonPath);
    }
    
    // Copy README.md to lib
    const readmePath = path.join(__dirname, 'README.md');
    const libReadmePath = path.join(LIB_DIR, 'README.md');
    if (fs.existsSync(readmePath)) {
      copyFile(readmePath, libReadmePath);
    }
    
    console.log('\n✅ Build completed successfully!');
    console.log(`📦 Output directory: ${LIB_DIR}`);
    
    // Show build statistics
    const libFiles = getAllFiles(LIB_DIR);
    console.log(`📊 Total files built: ${libFiles.length}`);
    
  } catch (error) {
    console.error('\n❌ Build failed:', error);
    process.exit(1);
  }
}

function getAllFiles(dirPath) {
  const files = [];
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}

// ========================================
// MAIN EXECUTION
// ========================================

if (require.main === module) {
  build();
}

module.exports = {
  build,
  copyDirectory,
  cleanDirectory
}; 