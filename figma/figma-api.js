const FIGMA_API_BASE = 'https://api.figma.com/v1';

/**
 * Parse Figma URL to extract file key and node ID
 * Supports: https://www.figma.com/design/<fileKey>/Name?node-id=0-1
 *           https://www.figma.com/file/<fileKey>/Name?node-id=0-1
 */
export function parseFigmaUrl(url) {
  const match = url.match(/figma\.com\/(?:design|file)\/([a-zA-Z0-9]+)/);
  if (!match) throw new Error('Invalid Figma URL');

  const fileKey = match[1];
  const urlObj = new URL(url);
  const nodeId = urlObj.searchParams.get('node-id')?.replace('-', ':') || null;

  return { fileKey, nodeId };
}

/**
 * Create Figma API client
 */
export function createFigmaClient(token) {
  async function request(endpoint) {
    const res = await fetch(`${FIGMA_API_BASE}${endpoint}`, {
      headers: { 'X-Figma-Token': token },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Figma API ${res.status}: ${text}`);
    }
    return res.json();
  }

  return {
    /** Get full file data */
    async getFile(fileKey, opts = {}) {
      const params = new URLSearchParams();
      if (opts.depth) params.set('depth', opts.depth);
      if (opts.nodeIds) params.set('ids', opts.nodeIds.join(','));
      const qs = params.toString();
      return request(`/files/${fileKey}${qs ? '?' + qs : ''}`);
    },

    /** Get specific nodes */
    async getNodes(fileKey, nodeIds) {
      const ids = nodeIds.join(',');
      return request(`/files/${fileKey}/nodes?ids=${encodeURIComponent(ids)}`);
    },

    /** Get images (rendered PNGs/SVGs) */
    async getImages(fileKey, nodeIds, opts = {}) {
      const params = new URLSearchParams({
        ids: nodeIds.join(','),
        format: opts.format || 'png',
        scale: String(opts.scale || 2),
      });
      return request(`/images/${fileKey}?${params}`);
    },

    /** Get file components */
    async getComponents(fileKey) {
      return request(`/files/${fileKey}/components`);
    },

    /** Get file styles */
    async getStyles(fileKey) {
      return request(`/files/${fileKey}/styles`);
    },

    /** Get comments */
    async getComments(fileKey) {
      return request(`/files/${fileKey}/comments`);
    },
  };
}

/**
 * Flatten Figma node tree into a flat array
 */
export function flattenNodes(node, result = []) {
  result.push(node);
  if (node.children) {
    for (const child of node.children) {
      flattenNodes(child, result);
    }
  }
  return result;
}

/**
 * Extract colors from Figma node fills
 */
export function extractColors(nodes) {
  const colors = new Map();
  for (const node of nodes) {
    const fills = node.fills || [];
    for (const fill of fills) {
      if (fill.type === 'SOLID' && fill.color) {
        const { r, g, b, a } = fill.color;
        const hex = rgbaToHex(r, g, b, a ?? 1);
        colors.set(hex, (colors.get(hex) || 0) + 1);
      }
    }
  }
  return [...colors.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([color, count]) => ({ color, count }));
}

/**
 * Extract text styles from Figma nodes
 */
export function extractTextStyles(nodes) {
  const styles = new Map();
  for (const node of nodes) {
    if (node.type === 'TEXT' && node.style) {
      const s = node.style;
      const key = `${s.fontFamily}_${s.fontSize}_${s.fontWeight}`;
      if (!styles.has(key)) {
        styles.set(key, {
          fontFamily: s.fontFamily,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          lineHeight: s.lineHeightPx,
          letterSpacing: s.letterSpacing,
          textAlign: s.textAlignHorizontal,
          count: 0,
        });
      }
      styles.get(key).count++;
    }
  }
  return [...styles.values()].sort((a, b) => b.count - a.count);
}

/**
 * Extract layout info from a frame node
 */
export function extractLayout(node) {
  return {
    name: node.name,
    type: node.type,
    width: node.absoluteBoundingBox?.width,
    height: node.absoluteBoundingBox?.height,
    layoutMode: node.layoutMode || null,
    primaryAxisAlignItems: node.primaryAxisAlignItems || null,
    counterAxisAlignItems: node.counterAxisAlignItems || null,
    padding: node.paddingLeft != null ? {
      top: node.paddingTop,
      right: node.paddingRight,
      bottom: node.paddingBottom,
      left: node.paddingLeft,
    } : null,
    itemSpacing: node.itemSpacing || null,
    cornerRadius: node.cornerRadius || null,
    fills: node.fills || [],
    strokes: node.strokes || [],
    effects: node.effects || [],
  };
}

/**
 * Build a simplified tree structure for easier consumption
 */
export function simplifyTree(node, depth = 0, maxDepth = 10) {
  if (depth > maxDepth) return null;

  const simplified = {
    id: node.id,
    name: node.name,
    type: node.type,
  };

  if (node.absoluteBoundingBox) {
    simplified.bounds = {
      x: Math.round(node.absoluteBoundingBox.x),
      y: Math.round(node.absoluteBoundingBox.y),
      w: Math.round(node.absoluteBoundingBox.width),
      h: Math.round(node.absoluteBoundingBox.height),
    };
  }

  if (node.type === 'TEXT') {
    simplified.text = node.characters;
    if (node.style) {
      simplified.font = `${node.style.fontFamily} ${node.style.fontWeight} ${node.style.fontSize}px`;
    }
  }

  if (node.fills?.length) {
    simplified.fills = node.fills
      .filter((f) => f.type === 'SOLID' && f.visible !== false)
      .map((f) => rgbaToHex(f.color.r, f.color.g, f.color.b, f.color.a ?? 1));
  }

  if (node.cornerRadius) {
    simplified.radius = node.cornerRadius;
  }

  if (node.layoutMode) {
    simplified.layout = node.layoutMode;
    if (node.itemSpacing) simplified.gap = node.itemSpacing;
  }

  if (node.children) {
    simplified.children = node.children
      .map((c) => simplifyTree(c, depth + 1, maxDepth))
      .filter(Boolean);
  }

  return simplified;
}

function rgbaToHex(r, g, b, a) {
  const toHex = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  return a < 1 ? `${hex}${toHex(a)}` : hex;
}
