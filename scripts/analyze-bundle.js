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
  
  while (size > 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function analyzeBundles() {
  const buildDir = path.join(process.cwd(), '.next');
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
        
        analysis.totalSize += size;
        analysis.chunks.push({
          name: file,
          size,
          formattedSize: formatSize(size)
        });
        
        // Check for size limits
        if (size > BUNDLE_SIZE_LIMITS.individual) {
          analysis.warnings.push(`Large chunk detected: ${file} (${formatSize(size)})`);
        }
        
        // Analyze third-party modules
        const content = fs.readFileSync(filePath, 'utf-8');
        const moduleMatches = content.match(/node_modules[\\/]([@\w-]+[\\/][\w-]+|[\w-]+)/g) || [];
        moduleMatches.forEach(module => {
          const moduleName = module.replace(/^node_modules[\\/]/, '');
          const currentSize = analysis.thirdPartyModules.get(moduleName) || 0;
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
        
        analysis.totalSize += size;
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
        
        analysis.totalSize += size;
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
  
  // Sort third-party modules by size
  const sortedModules = Array.from(analysis.thirdPartyModules.entries())
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
    chunks: analysis.chunks.sort((a, b) => b.size - a.size),
    thirdPartyModules: sortedModules,
    images: analysis.images.sort((a, b) => b.size - a.size),
    css: analysis.css.sort((a, b) => b.size - a.size),
    warnings: analysis.warnings
  };
  
  // Save detailed JSON report
  fs.writeFileSync(
    path.join(reportDir, 'bundle-analysis.json'),
    JSON.stringify(report, null, 2)
  );
  
  // Generate HTML report
  const htmlReport = generateHtmlReport(report);
  fs.writeFileSync(
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
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-gray-100 p-8">
  <div class="max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Bundle Analysis Report</h1>
    <p class="text-gray-600 mb-4">Generated on: ${report.timestamp}</p>
    <p class="text-xl mb-8">Total Bundle Size: <span class="font-bold">${report.totalSize}</span></p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- Bundle Size Distribution -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Bundle Size Distribution</h2>
        <canvas id="bundleChart"></canvas>
      </div>
      
      <!-- Warnings -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Warnings</h2>
        ${report.warnings.length > 0 
          ? `<ul class="list-disc pl-4 text-amber-600">
              ${report.warnings.map(w => `<li>${w}</li>`).join('')}
            </ul>`
          : '<p class="text-green-600">No warnings found</p>'
        }
      </div>
    </div>
    
    <!-- Detailed Analysis -->
    <div class="grid grid-cols-1 gap-6">
      <!-- JavaScript Chunks -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">JavaScript Chunks</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chunk</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${report.chunks.map(chunk => `
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${chunk.name}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${chunk.formattedSize}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Third Party Modules -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Third Party Modules</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${report.thirdPartyModules.map(module => `
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${module.name}</td>
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
            ${report.chunks.reduce((acc, chunk) => acc + chunk.size, 0)},
            ${report.css.reduce((acc, file) => acc + file.size, 0)},
            ${report.images.reduce((acc, img) => acc + img.size, 0)},
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
  console.log(`Reports generated in reports/bundle-analysis/`);
  
  if (report.warnings.length > 0) {
    console.log('\nWarnings:');
    report.warnings.forEach(warning => console.log(`- ${warning}`));
    process.exit(1);
  }
} 