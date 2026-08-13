import Papa from 'papaparse';

/**
 * Exports an array of objects to a CSV file and triggers a browser download.
 *
 * @param data     - Array of objects to export. Each object becomes a row;
 *                   object keys become column headers.
 * @param filename - Desired filename (without extension). '.csv' is appended automatically.
 *
 * @example
 * exportToCSV(transactions, 'transactions-june-2026');
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string
): void {
  if (data.length === 0) {
    console.warn('exportToCSV: No data to export.');
    return;
  }

  const csv = Papa.unparse(data, {
    quotes: true,
    header: true,
  });

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses an uploaded CSV file and returns the data as an array of objects.
 *
 * Each row is returned as a key-value object where keys are the column headers
 * from the first row of the CSV.
 *
 * @param file - A File object (from an <input type="file"> element)
 * @returns Promise resolving to an array of parsed row objects
 *
 * @example
 * const fileInput = document.querySelector('input[type="file"]');
 * const data = await importCSV(fileInput.files[0]);
 * console.log(data); // [{ amount: '500', category: 'food', ... }, ...]
 */
export function importCSV<T = Record<string, string>>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      reject(new Error('File must be a CSV file'));
      return;
    }

    Papa.parse<T>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (header: string) => header.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          const errorMessages = results.errors
            .slice(0, 5)
            .map((e) => `Row ${e.row}: ${e.message}`)
            .join('; ');
          console.warn('CSV parsing had errors:', errorMessages);
        }
        resolve(results.data);
      },
      error: (error: Error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}
