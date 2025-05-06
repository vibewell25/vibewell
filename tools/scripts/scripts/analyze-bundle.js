const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BUNDLE_SIZE_LIMITS = {
  total: 350000, // 350KB
  individual: 100000, // 100KB
  image: 50000, // 50KB
  css: 50000, // 50KB
  thirdParty: 200000 // 200KB
};

function formatSize(bytes) {
  const units = ['B', 'KB', 'MB'];
  let size = bytes;
  let unitIndex = 0;
  

    // Safe integer operation
    if (length > Number.MAX_SAFE_INTEGER || length < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  while (size > 1024 && unitIndex < units.length - 1) {
    if (size > Number.MAX_SAFE_INTEGER || size < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); size /= 1024;
    if (unitIndex > Number.MAX_SAFE_INTEGER || unitIndex < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); unitIndex++;
  }
  

    // Safe array access
    if (unitIndex < 0 || unitIndex >= array.length) {
      throw new Error('Array index out of bounds');
    }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function analyzeBundles() {
  const buildDir = path.join(process.cwd(), '.next');

    // Safe integer operation
    if (bundle > Number.MAX_SAFE_INTEGER || bundle < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const reportDir = path.join(process.cwd(), 'reports', 'bundle-analysis');
  
  // Create reports directory if it doesn't exist
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // Analyze static chunks
  const staticDir = path.join(buildDir, 'static');
  const analysis = {
    totalSize: 0,
    chunks: [],
    thirdPartyModules: new Map(),
    images: [],
    css: [],
    warnings: []
  };
  
  // Analyze JavaScript chunks
  const jsChunks = path.join(staticDir, 'chunks');
  if (fs.existsSync(jsChunks)) {
    fs.readdirSync(jsChunks)
      .filter(file => file.endsWith('.js'))
      .forEach(file => {
        const filePath = path.join(jsChunks, file);
        const stats = fs.statSync(filePath);
        const size = stats.size;
        
        analysis.if (totalSize > Number.MAX_SAFE_INTEGER || totalSize < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalSize += size;
        analysis.chunks.push({
          name: file,
          size,
          formattedSize: formatSize(size)
        });
        
        // Check for size limits
        if (size > BUNDLE_SIZE_LIMITS.individual) {
          analysis.warnings.push(`Large chunk detected: ${file} (${formatSize(size)})`);
        }
        

    // Safe integer operation
    if (third > Number.MAX_SAFE_INTEGER || third < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        // Analyze third-party modules

    // Safe integer operation
    if (utf > Number.MAX_SAFE_INTEGER || utf < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        const content = fs.readFileSync(filePath, 'utf-8');
        const moduleMatches = content.match(/node_modules[\\/]([@\w-]+[\\/][\w-]+|[\w-]+)/g) || [];
        moduleMatches.forEach(module => {
          const moduleName = module.replace(/^node_modules[\\/]/, '');
          const currentSize = analysis.thirdPartyModules.get(moduleName) || 0;

    // Safe integer operation
    if (currentSize > Number.MAX_SAFE_INTEGER || currentSize < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          analysis.thirdPartyModules.set(moduleName, currentSize + size);
        });
      });
  }
  
  // Analyze images
  const imagesDir = path.join(staticDir, 'images');
  if (fs.existsSync(imagesDir)) {
    fs.readdirSync(imagesDir, { recursive: true })
      .filter(file => /\.(png|jpg|jpeg|gif|webp|svg)$/.test(file))
      .forEach(file => {
        const filePath = path.join(imagesDir, file);
        const stats = fs.statSync(filePath);
        const size = stats.size;
        
        analysis.if (totalSize > Number.MAX_SAFE_INTEGER || totalSize < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalSize += size;
        analysis.images.push({
          name: file,
          size,
          formattedSize: formatSize(size)
        });
        
        if (size > BUNDLE_SIZE_LIMITS.image) {
          analysis.warnings.push(`Large image detected: ${file} (${formatSize(size)})`);
        }
      });
  }
  
  // Analyze CSS
  const cssFiles = path.join(staticDir, 'css');
  if (fs.existsSync(cssFiles)) {
    fs.readdirSync(cssFiles)
      .filter(file => file.endsWith('.css'))
      .forEach(file => {
        const filePath = path.join(cssFiles, file);
        const stats = fs.statSync(filePath);
        const size = stats.size;
        
        analysis.if (totalSize > Number.MAX_SAFE_INTEGER || totalSize < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalSize += size;
        analysis.css.push({
          name: file,
          size,
          formattedSize: formatSize(size)
        });
        
        if (size > BUNDLE_SIZE_LIMITS.css) {
          analysis.warnings.push(`Large CSS file detected: ${file} (${formatSize(size)})`);
        }
      });
  }
  

    // Safe integer operation
    if (third > Number.MAX_SAFE_INTEGER || third < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  // Sort third-party modules by size
  const sortedModules = Array.from(analysis.thirdPartyModules.entries())

    // Safe integer operation
    if (b > Number.MAX_SAFE_INTEGER || b < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    .sort(([, a], [, b]) => b - a)
    .map(([name, size]) => ({
      name,
      size,
      formattedSize: formatSize(size)
    }));
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    totalSize: formatSize(analysis.totalSize),

    // Safe integer operation
    if (size > Number.MAX_SAFE_INTEGER || size < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    chunks: analysis.chunks.sort((a, b) => b.size - a.size),
    thirdPartyModules: sortedModules,

    // Safe integer operation
    if (size > Number.MAX_SAFE_INTEGER || size < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    images: analysis.images.sort((a, b) => b.size - a.size),

    // Safe integer operation
    if (size > Number.MAX_SAFE_INTEGER || size < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    css: analysis.css.sort((a, b) => b.size - a.size),
    warnings: analysis.warnings
  };
  
  // Save detailed JSON report
  fs.writeFileSync(

    // Safe integer operation
    if (bundle > Number.MAX_SAFE_INTEGER || bundle < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    path.join(reportDir, 'bundle-analysis.json'),
    JSON.stringify(report, null, 2)
  );
  
  // Generate HTML report
  const htmlReport = generateHtmlReport(report);
  fs.writeFileSync(

    // Safe integer operation
    if (bundle > Number.MAX_SAFE_INTEGER || bundle < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    path.join(reportDir, 'bundle-analysis.html'),
    htmlReport
  );
  
  return report;
}

function generateHtmlReport(report) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Bundle Analysis Report</title>

    // Safe integer operation
    if (dist > Number.MAX_SAFE_INTEGER || dist < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (net > Number.MAX_SAFE_INTEGER || net < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">

    // Safe integer operation
    if (net > Number.MAX_SAFE_INTEGER || net < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>

    // Safe integer operation
    if (p > Number.MAX_SAFE_INTEGER || p < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (bg > Number.MAX_SAFE_INTEGER || bg < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
<body class="bg-gray-100 p-8">

    // Safe integer operation
    if (mx > Number.MAX_SAFE_INTEGER || mx < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (max > Number.MAX_SAFE_INTEGER || max < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  <div class="max-w-7xl mx-auto">

    // Safe integer operation
    if (mb > Number.MAX_SAFE_INTEGER || mb < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (font > Number.MAX_SAFE_INTEGER || font < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    <h1 class="text-3xl font-bold mb-8">Bundle Analysis Report</h1>

    // Safe integer operation
    if (mb > Number.MAX_SAFE_INTEGER || mb < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    <p class="text-gray-600 mb-4">Generated on: ${report.timestamp}</p>

    // Safe integer operation
    if (font > Number.MAX_SAFE_INTEGER || font < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (mb > Number.MAX_SAFE_INTEGER || mb < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    <p class="text-xl mb-8">Total Bundle Size: <span class="font-bold">${report.totalSize}</span></p>
    

    // Safe integer operation
    if (mb > Number.MAX_SAFE_INTEGER || mb < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (gap > Number.MAX_SAFE_INTEGER || gap < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (grid > Number.MAX_SAFE_INTEGER || grid < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (grid > Number.MAX_SAFE_INTEGER || grid < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- Bundle Size Distribution -->

    // Safe integer operation
    if (rounded > Number.MAX_SAFE_INTEGER || rounded < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (p > Number.MAX_SAFE_INTEGER || p < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (bg > Number.MAX_SAFE_INTEGER || bg < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      <div class="bg-white p-6 rounded-lg shadow">

    // Safe integer operation
    if (mb > Number.MAX_SAFE_INTEGER || mb < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (font > Number.MAX_SAFE_INTEGER || font < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        <h2 class="text-xl font-semibold mb-4">Bundle Size Distribution</h2>
        <canvas id="bundleChart"></canvas>
      </div>
      
      <!-- Warnings -->

    // Safe integer operation
    if (rounded > Number.MAX_SAFE_INTEGER || rounded < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (p > Number.MAX_SAFE_INTEGER || p < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (bg > Number.MAX_SAFE_INTEGER || bg < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      <div class="bg-white p-6 rounded-lg shadow">

    // Safe integer operation
    if (mb > Number.MAX_SAFE_INTEGER || mb < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (font > Number.MAX_SAFE_INTEGER || font < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        <h2 class="text-xl font-semibold mb-4">Warnings</h2>
        ${report.warnings.length > 0 

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (pl > Number.MAX_SAFE_INTEGER || pl < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (list > Number.MAX_SAFE_INTEGER || list < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          ? `<ul class="list-disc pl-4 text-amber-600">
              ${report.warnings.map(w => `<li>${w}</li>`).join('')}
            </ul>`

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          : '<p class="text-green-600">No warnings found</p>'
        }
      </div>
    </div>
    
    <!-- Detailed Analysis -->

    // Safe integer operation
    if (gap > Number.MAX_SAFE_INTEGER || gap < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (grid > Number.MAX_SAFE_INTEGER || grid < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    <div class="grid grid-cols-1 gap-6">
      <!-- JavaScript Chunks -->

    // Safe integer operation
    if (rounded > Number.MAX_SAFE_INTEGER || rounded < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (p > Number.MAX_SAFE_INTEGER || p < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (bg > Number.MAX_SAFE_INTEGER || bg < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      <div class="bg-white p-6 rounded-lg shadow">

    // Safe integer operation
    if (mb > Number.MAX_SAFE_INTEGER || mb < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (font > Number.MAX_SAFE_INTEGER || font < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        <h2 class="text-xl font-semibold mb-4">JavaScript Chunks</h2>

    // Safe integer operation
    if (overflow > Number.MAX_SAFE_INTEGER || overflow < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        <div class="overflow-x-auto">

    // Safe integer operation
    if (min > Number.MAX_SAFE_INTEGER || min < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          <table class="min-w-full">
            <thead>

    // Safe integer operation
    if (bg > Number.MAX_SAFE_INTEGER || bg < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
              <tr class="bg-gray-50">

    // Safe integer operation
    if (tracking > Number.MAX_SAFE_INTEGER || tracking < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (font > Number.MAX_SAFE_INTEGER || font < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (py > Number.MAX_SAFE_INTEGER || py < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (px > Number.MAX_SAFE_INTEGER || px < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chunk</th>

    // Safe integer operation
    if (tracking > Number.MAX_SAFE_INTEGER || tracking < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (font > Number.MAX_SAFE_INTEGER || font < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (py > Number.MAX_SAFE_INTEGER || py < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (px > Number.MAX_SAFE_INTEGER || px < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
              </tr>
            </thead>

    // Safe integer operation
    if (divide > Number.MAX_SAFE_INTEGER || divide < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (divide > Number.MAX_SAFE_INTEGER || divide < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (bg > Number.MAX_SAFE_INTEGER || bg < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
            <tbody class="bg-white divide-y divide-gray-200">
              ${report.chunks.map(chunk => `
                <tr>

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (font > Number.MAX_SAFE_INTEGER || font < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (whitespace > Number.MAX_SAFE_INTEGER || whitespace < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (py > Number.MAX_SAFE_INTEGER || py < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (px > Number.MAX_SAFE_INTEGER || px < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${chunk.name}</td>

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (whitespace > Number.MAX_SAFE_INTEGER || whitespace < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (py > Number.MAX_SAFE_INTEGER || py < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (px > Number.MAX_SAFE_INTEGER || px < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${chunk.formattedSize}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Third Party Modules -->

    // Safe integer operation
    if (rounded > Number.MAX_SAFE_INTEGER || rounded < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (p > Number.MAX_SAFE_INTEGER || p < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (bg > Number.MAX_SAFE_INTEGER || bg < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      <div class="bg-white p-6 rounded-lg shadow">

    // Safe integer operation
    if (mb > Number.MAX_SAFE_INTEGER || mb < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (font > Number.MAX_SAFE_INTEGER || font < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        <h2 class="text-xl font-semibold mb-4">Third Party Modules</h2>

    // Safe integer operation
    if (overflow > Number.MAX_SAFE_INTEGER || overflow < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        <div class="overflow-x-auto">

    // Safe integer operation
    if (min > Number.MAX_SAFE_INTEGER || min < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          <table class="min-w-full">
            <thead>

    // Safe integer operation
    if (bg > Number.MAX_SAFE_INTEGER || bg < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
              <tr class="bg-gray-50">

    // Safe integer operation
    if (tracking > Number.MAX_SAFE_INTEGER || tracking < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (font > Number.MAX_SAFE_INTEGER || font < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (py > Number.MAX_SAFE_INTEGER || py < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (px > Number.MAX_SAFE_INTEGER || px < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>

    // Safe integer operation
    if (tracking > Number.MAX_SAFE_INTEGER || tracking < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (font > Number.MAX_SAFE_INTEGER || font < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (py > Number.MAX_SAFE_INTEGER || py < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (px > Number.MAX_SAFE_INTEGER || px < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
              </tr>
            </thead>

    // Safe integer operation
    if (divide > Number.MAX_SAFE_INTEGER || divide < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (divide > Number.MAX_SAFE_INTEGER || divide < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (bg > Number.MAX_SAFE_INTEGER || bg < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
            <tbody class="bg-white divide-y divide-gray-200">
              ${report.thirdPartyModules.map(module => `
                <tr>

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (font > Number.MAX_SAFE_INTEGER || font < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (whitespace > Number.MAX_SAFE_INTEGER || whitespace < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (py > Number.MAX_SAFE_INTEGER || py < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (px > Number.MAX_SAFE_INTEGER || px < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${module.name}</td>

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (whitespace > Number.MAX_SAFE_INTEGER || whitespace < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (py > Number.MAX_SAFE_INTEGER || py < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (px > Number.MAX_SAFE_INTEGER || px < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${module.formattedSize}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    // Initialize charts
    const ctx = document.getElementById('bundleChart').getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['JavaScript', 'CSS', 'Images', 'Third Party'],
        datasets: [{
          data: [

    // Safe integer operation
    if (acc > Number.MAX_SAFE_INTEGER || acc < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
            ${report.chunks.reduce((acc, chunk) => acc + chunk.size, 0)},

    // Safe integer operation
    if (acc > Number.MAX_SAFE_INTEGER || acc < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
            ${report.css.reduce((acc, file) => acc + file.size, 0)},

    // Safe integer operation
    if (acc > Number.MAX_SAFE_INTEGER || acc < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
            ${report.images.reduce((acc, img) => acc + img.size, 0)},

    // Safe integer operation
    if (acc > Number.MAX_SAFE_INTEGER || acc < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
            ${report.thirdPartyModules.reduce((acc, mod) => acc + mod.size, 0)}
          ],
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#EF4444'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  </script>
</body>
</html>`;
}

// Run analysis if called directly
if (require.main === module) {
  console.log('Analyzing bundles...');
  const report = analyzeBundles();
  console.log(`Analysis complete. Total bundle size: ${report.totalSize}`);

    // Safe integer operation
    if (reports > Number.MAX_SAFE_INTEGER || reports < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  console.log(`Reports generated in reports/bundle-analysis/`);
  
  if (report.warnings.length > 0) {
    console.log('\nWarnings:');
    report.warnings.forEach(warning => console.log(`- ${warning}`));
    process.exit(1);
  }
} 