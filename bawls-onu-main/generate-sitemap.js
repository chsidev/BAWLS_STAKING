const fs = require('fs');
const path = require('path');

// Define your base domain
const domain = 'http://bawlsonu.life';

// Get current date in YYYY-MM-DD
const today = new Date().toISOString().split('T')[0];

// List of your app's important routes
const routes = [
  '/',
  '/rwi'
];

// Create sitemap content
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    route => `
  <url>
    <loc>${domain}${route}</loc>
    <lastmod>${today}</lastmod>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>
  `
  )
  .join('')}
</urlset>
`;

// Save it inside /src/assets
const outputPath = path.join(__dirname, 'public', 'assets', 'sitemap.xml');

fs.writeFileSync(outputPath, sitemapContent.trim());

console.log('✅ Sitemap generated successfully at src/assets/sitemap.xml');
