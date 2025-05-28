// Types for our Apps Script API responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

if (!SCRIPT_URL) {
  throw new Error('Google Apps Script URL not configured');
}

// Helper function to get the last row with data
export const getLastRowWithData = async (sheetName: string): Promise<number> => {
  try {
    const result = await fetchFromScript<number>('getLastRow', { sheetName });
    return result || 100; // Fallback to 100 if no result
  } catch (error) {
    console.error(`Error getting last row for ${sheetName}:`, error);
    return 100; // Fallback value
  }
};

// Fetch data from a specific sheet range
export const fetchSheet = async (range: string): Promise<any[][]> => {
  try {
    return await fetchFromScript<any[][]>('getRange', { range });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
};

// Delete all rows for a specific order
export const deleteOrderRows = async (receptionNumber: string, clientCIF: string): Promise<void> => {
  try {
    await fetchFromScript('deleteOrderRows', { receptionNumber, clientCIF });
  } catch (error) {
    console.error('Error deleting order rows:', error);
    throw error;
  }
};

// Generic function to fetch data from Apps Script
async function fetchFromScript<T>(action: string, params: Record<string, any> = {}): Promise<T> {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, ...params }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<T> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error occurred');
    }

    return result.data!;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Export the API functions
export const sheetsApi = {
  getLastRowWithData,
  fetchSheet,
  deleteOrderRows,
  appendToSheet: async (range: string, values: any[][]) => {
    return fetchFromScript('appendRows', { range, values });
  },
  updateSheet: async (range: string, values: any[][]) => {
    return fetchFromScript('updateRange', { range, values });
  }
};