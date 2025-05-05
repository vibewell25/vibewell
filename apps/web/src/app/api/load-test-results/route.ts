import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

import { applyRateLimit, adminRateLimiter } from '@/lib/rate-limiter';

// Helper to read a directory and list files
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); listFiles(dirPath: string) {
  try {
    const files = await fs.promises.readdir(dirPath);
    return files.filter((file) => file.endsWith('.json') || file.endsWith('.html'));
catch (error) {
    console.error('Error reading directory:', error);
    return [];
// Get load test results
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); GET(req: NextRequest) {
  // Apply admin rate limiting
  const rateLimitResult = await applyRateLimit(req, adminRateLimiter);
  if (rateLimitResult) {
    return rateLimitResult;
const searchParams = req.nextUrl.searchParams;
  const file = searchParams.get('file');


  const resultsDirPath = path.join(process.cwd(), 'load-test-results');

  // If a specific file is requested
  if (file) {
    try {
      const filePath = path.join(resultsDirPath, file);


      // Security check - ensure the file is actually in our results directory
      const resolvedPath = path.resolve(filePath);
      if (!resolvedPath.startsWith(resultsDirPath)) {
        return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
const fileContent = await fs.promises.readFile(filePath, 'utf8');

      // Return appropriate content type based on file extension
      if (file.endsWith('.json')) {
        return NextResponse.json(JSON.parse(fileContent));
else if (file.endsWith('.html')) {
        return new NextResponse(fileContent, {


          headers: { 'Content-Type': 'text/html' },
else {
        return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
catch (error) {
      console.error('Error reading file:', error);
      return NextResponse.json({ error: 'Error reading file' }, { status: 500 });
// List all available result files
  try {
    if (!fs.existsSync(resultsDirPath)) {
      return NextResponse.json({ files: [], message: 'No load test results found' });
const files = await listFiles(resultsDirPath);

    // Group files by test run
    const testRuns = files.reduce(
      (groups, file) => {
        // Extract timestamp from filenames like general_20231125_120000.json
        const match = file.match(/(\d{8}_\d{6})/);
        if (match) {
          const timestamp = match[1];

    if (!groups[timestamp]) {

    groups[timestamp] = [];
groups[timestamp].push(file);
else if (file.includes('report_')) {
          // Handle report files
          const reportMatch = file.match(/report_(\d{8}_\d{6})\.html/);
          if (reportMatch) {
            const timestamp = reportMatch[1];

    if (!groups[timestamp]) {

    groups[timestamp] = [];
groups[timestamp].push(file);
return groups;
{} as Record<string, string[]>,
return NextResponse.json({
      testRuns,
      files,


      baseUrl: `/api/load-test-results?file=`,
catch (error) {
    console.error('Error listing results:', error);
    return NextResponse.json({ error: 'Error listing results' }, { status: 500 });
