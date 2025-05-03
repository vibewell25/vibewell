#!/bin/bash

# Mobile Optimization Script

# Configuration
LIGHTHOUSE_REPORTS_DIR="reports/lighthouse"
MOBILE_TEST_URLS=(
    "http://localhost:3000"
    "http://localhost:3000/booking"
    "http://localhost:3000/profile"
    "http://localhost:3000/services"
)

# Function to run Lighthouse tests
run_lighthouse_tests() {
    echo "Running Lighthouse tests for mobile..."
    mkdir -p $LIGHTHOUSE_REPORTS_DIR
    
    for url in "${MOBILE_TEST_URLS[@]}"; do
        echo "Testing $url..."
        filename=$(echo $url | sed 's|http://localhost:3000/||' | sed 's|/|_|g')
        if [ -z "$filename" ]; then
            filename="home"
        fi
        
        lighthouse $url \
            --output=html \
            --output-path="$LIGHTHOUSE_REPORTS_DIR/${filename}_mobile.html" \
            --chrome-flags="--headless" \
            --emulated-form-factor=mobile \
            --throttling-method=provided \
            --throttling.rttMs=150 \
            --throttling.throughputKbps=1638.4 \
            --throttling.cpuSlowdownMultiplier=4
    done
}

# Function to optimize images
optimize_images() {
    echo "Optimizing images..."
    find public/images -type f \( -iname "*.jpg" -o -iname "*.png" -o -iname "*.webp" \) -exec \
        convert {} -strip -quality 85 -resize '1200x1200>' {} \;
}

# Function to generate service worker
generate_service_worker() {
    echo "Generating service worker..."
    cat > public/sw.js << 'EOL'
const CACHE_NAME = 'vibewell-cache-v1';
const urlsToCache = [
    '/',
    '/styles.css',
    '/main.js',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
EOL
}

# Function to update manifest
update_manifest() {
    echo "Updating web app manifest..."
    cat > public/manifest.json << 'EOL'
{
    "name": "Vibewell",
    "short_name": "Vibewell",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#000000",
    "icons": [
        {
            "src": "/icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/icons/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}
EOL
}

# Main execution
echo "Starting mobile optimization..."

# Run tests
run_lighthouse_tests

# Optimize images
optimize_images

# Generate service worker
generate_service_worker

# Update manifest
update_manifest

echo "Mobile optimization completed"
echo "Lighthouse reports available in $LIGHTHOUSE_REPORTS_DIR" 