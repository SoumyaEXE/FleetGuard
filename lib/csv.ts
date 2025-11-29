import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const REPAIRS_CSV = path.join(DATA_DIR, 'repairs.csv');

const CSV_HEADER = 'id,vehicleId,damageLevel,repairDate,createdAt,driverEmail,managerEmail,status,inspectionId\n';

/**
 * Escape CSV value: wrap in quotes if contains comma, quote, or newline
 */
function escapeCSVValue(value: string): string {
  if (!value) return '';
  
  const needsQuoting = /[",\n\r]/.test(value);
  
  if (needsQuoting) {
    // Escape quotes by doubling them
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  
  return value;
}

/**
 * Ensure the data directory and repairs.csv file exist with proper header
 */
export async function ensureCSVExists(): Promise<void> {
  try {
    // Create data directory if it doesn't exist
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Check if CSV exists
    try {
      await fs.access(REPAIRS_CSV);
    } catch {
      // File doesn't exist, create it with header
      await fs.writeFile(REPAIRS_CSV, CSV_HEADER, 'utf-8');
    }
  } catch (error) {
    console.error('Error ensuring CSV exists:', error);
    throw new Error('Failed to initialize CSV file');
  }
}

/**
 * Append a repair record to the CSV file
 */
export async function appendRepairToCSV(repair: {
  id: string;
  vehicleId: string;
  damageLevel: string;
  repairDate: string;
  createdAt: string;
  driverEmail: string;
  managerEmail?: string;
  status: string;
  inspectionId?: string;
}): Promise<void> {
  await ensureCSVExists();
  
  const row = [
    escapeCSVValue(repair.id),
    escapeCSVValue(repair.vehicleId),
    escapeCSVValue(repair.damageLevel),
    escapeCSVValue(repair.repairDate),
    escapeCSVValue(repair.createdAt),
    escapeCSVValue(repair.driverEmail),
    escapeCSVValue(repair.managerEmail || ''),
    escapeCSVValue(repair.status),
    escapeCSVValue(repair.inspectionId || ''),
  ].join(',') + '\n';
  
  try {
    await fs.appendFile(REPAIRS_CSV, row, 'utf-8');
  } catch (error) {
    console.error('Error appending to CSV:', error);
    throw new Error('Failed to save repair to CSV');
  }
}

/**
 * Read all repairs from CSV (optional helper for future use)
 */
export async function readRepairsFromCSV(): Promise<any[]> {
  try {
    await ensureCSVExists();
    const content = await fs.readFile(REPAIRS_CSV, 'utf-8');
    const lines = content.trim().split('\n');
    
    if (lines.length <= 1) return []; // Only header or empty
    
    const headers = lines[0].split(',');
    const repairs = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const repair: any = {};
      
      headers.forEach((header, index) => {
        repair[header] = values[index] || '';
      });
      
      repairs.push(repair);
    }
    
    return repairs;
  } catch (error) {
    console.error('Error reading CSV:', error);
    return [];
  }
}
