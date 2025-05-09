/**
 * PDF generation utilities
 */

import * as fs from 'fs';

// Import puppeteer as a dynamic import to handle potential missing dependency
let puppeteer: any;
try {
  // This will be properly imported when the project has puppeteer installed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  puppeteer = require('puppeteer');
} catch (err) {
  console.warn('Puppeteer not found. PDF generation will not work until you install it.');
  console.warn('Run: npm install puppeteer --save');
}

/**
 * Generate a PDF from an HTML file
 * 
 * @param htmlPath Path to the HTML file
 * @param outputPath Path where the PDF should be saved
 * @returns Promise resolving to the path of the generated PDF
 */
export async function generatePDF(htmlPath: string, outputPath: string): Promise<string> {
  try {
    if (!puppeteer) {
      throw new Error('Puppeteer is not installed. Run: npm install puppeteer --save');
    }
    
    console.log(`Generating PDF from ${htmlPath}...`);
    
    // Read HTML file
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    // Create new page
    const page = await browser.newPage();
    
    // Set content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });
    
    // Add styles for printing
    await page.addStyleTag({
      content: `
        @page {
          margin: 15mm;
          size: A4;
        }
        
        body {
          font-family: Arial, sans-serif;
        }
      `,
    });
    
    // Generate PDF
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm',
      },
    });
    
    // Close browser
    await browser.close();
    
    console.log(`PDF generated successfully: ${outputPath}`);
    return outputPath;
  } catch (error: unknown) {
    console.error('Failed to generate PDF:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`PDF generation failed: ${errorMessage}`);
  }
} 