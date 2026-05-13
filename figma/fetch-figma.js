#!/usr/bin/env node

/**
 * Fetch Figma design data and export images
 *
 * Usage:
 *   node figma/fetch-figma.js <FIGMA_URL> [--token TOKEN] [--images] [--depth N]
 *
 * Environment:
 *   FIGMA_TOKEN - Figma Personal Access Token
 *
 * Examples:
 *   export FIGMA_TOKEN=figd_xxxxx
 *   node figma/fetch-figma.js "https://www.figma.com/design/o1syNp93H3v2dyA3JHp4em/Mary?node-id=0-1"
 *   node figma/fetch-figma.js "https://www.figma.com/design/o1syNp93H3v2dyA3JHp4em/Mary?node-id=0-1" --images
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  parseFigmaUrl,
  createFigmaClient,
  flattenNodes,
  extractColors,
  extractTextStyles,
  simplifyTree,
} from './figma-api.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, 'output');

// Parse CLI args
const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--'));
const token = getArg('--token') || process.env.FIGMA_TOKEN;
const exportImages = args.includes('--images');
const depth = getArg('--depth');

if (!url) {
  console.error('Usage: node figma/fetch-figma.js <FIGMA_URL> [--token TOKEN] [--images] [--depth N]');
  process.exit(1);
}

if (!token) {
  console.error('Error: Figma token required. Set FIGMA_TOKEN env var or use --token flag.');
  console.error('Get your token at: Figma → Settings → Personal Access Tokens');
  process.exit(1);
}

async function main() {
  const { fileKey, nodeId } = parseFigmaUrl(url);
  console.log(`File: ${fileKey}, Node: ${nodeId || 'root'}`);

  const client = createFigmaClient(token);

  // Fetch file data
  console.log('Fetching file data...');
  const fileData = await client.getFile(fileKey, {
    depth: depth ? Number(depth) : undefined,
  });

  console.log(`File: "${fileData.name}" (last modified: ${fileData.lastModified})`);

  // Get target node
  let targetNode = fileData.document;
  if (nodeId) {
    const nodesData = await client.getNodes(fileKey, [nodeId]);
    const nodeData = nodesData.nodes[nodeId];
    if (!nodeData) {
      console.error(`Node ${nodeId} not found`);
      process.exit(1);
    }
    targetNode = nodeData.document;
    console.log(`Target node: "${targetNode.name}" (${targetNode.type})`);
  }

  // Flatten and analyze
  const allNodes = flattenNodes(targetNode);
  console.log(`Total nodes: ${allNodes.length}`);

  const colors = extractColors(allNodes);
  const textStyles = extractTextStyles(allNodes);
  const tree = simplifyTree(targetNode);

  // Fetch styles
  console.log('Fetching styles...');
  let styles = {};
  try {
    const stylesData = await client.getStyles(fileKey);
    styles = stylesData.meta?.styles || [];
  } catch (e) {
    console.warn('Could not fetch styles:', e.message);
  }

  // Build report
  const report = {
    file: {
      name: fileData.name,
      key: fileKey,
      lastModified: fileData.lastModified,
      version: fileData.version,
    },
    targetNode: nodeId || 'document',
    stats: {
      totalNodes: allNodes.length,
      frames: allNodes.filter((n) => n.type === 'FRAME').length,
      components: allNodes.filter((n) => n.type === 'COMPONENT').length,
      instances: allNodes.filter((n) => n.type === 'INSTANCE').length,
      texts: allNodes.filter((n) => n.type === 'TEXT').length,
      vectors: allNodes.filter((n) => n.type === 'VECTOR').length,
    },
    colors: colors.slice(0, 20),
    textStyles: textStyles.slice(0, 15),
    styles,
    tree,
  };

  // Save output
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const reportPath = join(OUTPUT_DIR, 'figma-data.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport saved: ${reportPath}`);

  // Export images
  if (exportImages) {
    console.log('\nExporting images...');
    const frameNodes = allNodes
      .filter((n) => ['FRAME', 'COMPONENT', 'INSTANCE'].includes(n.type) && n.absoluteBoundingBox)
      .slice(0, 50); // limit to 50 images

    if (frameNodes.length > 0) {
      const nodeIds = frameNodes.map((n) => n.id);
      const imagesData = await client.getImages(fileKey, nodeIds, { format: 'png', scale: 2 });

      const imagesDir = join(OUTPUT_DIR, 'images');
      mkdirSync(imagesDir, { recursive: true });

      const imageMap = {};
      for (const [id, imageUrl] of Object.entries(imagesData.images || {})) {
        if (!imageUrl) continue;
        const node = frameNodes.find((n) => n.id === id);
        const safeName = (node?.name || id).replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `${safeName}.png`;

        try {
          const imgRes = await fetch(imageUrl);
          const buffer = Buffer.from(await imgRes.arrayBuffer());
          const imgPath = join(imagesDir, filename);
          writeFileSync(imgPath, buffer);
          imageMap[id] = { name: node?.name, file: filename };
          console.log(`  Saved: ${filename}`);
        } catch (e) {
          console.warn(`  Failed to download ${id}: ${e.message}`);
        }
      }

      writeFileSync(join(imagesDir, 'index.json'), JSON.stringify(imageMap, null, 2));
      console.log(`\nExported ${Object.keys(imageMap).length} images`);
    } else {
      console.log('No exportable frames found');
    }
  }

  // Print summary
  console.log('\n--- Summary ---');
  console.log(`Nodes: ${report.stats.totalNodes} (${report.stats.frames} frames, ${report.stats.components} components, ${report.stats.texts} texts)`);
  console.log(`Colors: ${colors.slice(0, 5).map((c) => c.color).join(', ')}${colors.length > 5 ? ` (+${colors.length - 5} more)` : ''}`);
  console.log(`Fonts: ${textStyles.slice(0, 3).map((s) => `${s.fontFamily} ${s.fontSize}px`).join(', ')}${textStyles.length > 3 ? ` (+${textStyles.length - 3} more)` : ''}`);
  console.log(`\nFull data: ${reportPath}`);
}

function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : null;
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
