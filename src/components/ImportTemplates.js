import * as XLSX from 'xlsx';

export const generateTemplate = (entityType) => {
  let headers = [];
  let sampleData = [];

  switch (entityType) {
    case 'customers':
      headers = ['Name', 'Email', 'Phone', 'Address', 'LGA', 'CreditLimit', 'Balance'];
      sampleData = [
        ['John Doe', 'john@example.com', '08012345678', '123 Main St', 'Ikeja', '500000', '0']
      ];
      break;
    case 'suppliers':
      headers = ['Name', 'Email', 'Phone', 'Address', 'LGA', 'CreditLimit', 'Balance'];
      sampleData = [
        ['ABC Supplies', 'abc@example.com', '08087654321', '456 Supply St', 'Lekki', '1000000', '0']
      ];
      break;
    case 'coa':
      headers = ['Account Code', 'Account Name', 'Account Type', 'Balance'];
      sampleData = [
        ['1000', 'Cash', 'Asset', '0'],
        ['2000', 'Accounts Payable', 'Liability', '0'],
        ['3000', 'Capital', 'Equity', '0'],
        ['4000', 'Sales', 'Revenue', '0']
      ];
      break;
    default:
      return null;
  }

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  
  const fileName = `${entityType}_import_template.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const validateImportData = (data, entityType) => {
  if (!Array.isArray(data) || data.length === 0) {
    return { valid: false, error: 'No data found in file' };
  }

  let requiredColumns = [];
  switch (entityType) {
    case 'customers':
    case 'suppliers':
      requiredColumns = ['Name', 'Email', 'Phone', 'Address', 'LGA'];
      break;
    case 'coa':
      requiredColumns = ['Account Code', 'Account Name', 'Account Type', 'Balance'];
      break;
    default:
      return { valid: false, error: 'Invalid entity type' };
  }

  // Check headers
  const headers = Object.keys(data[0]);
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  if (missingColumns.length > 0) {
    return {
      valid: false,
      error: `Missing required columns: ${missingColumns.join(', ')}`
    };
  }

  // Validate data types and required fields
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    if (entityType === 'coa') {
      if (!row['Account Code'] || !row['Account Name'] || !row['Account Type']) {
        return {
          valid: false,
          error: `Row ${i + 1}: Account Code, Account Name, and Account Type are required`
        };
      }
      
      if (isNaN(parseFloat(row['Balance']))) {
        return {
          valid: false,
          error: `Row ${i + 1}: Balance must be a number`
        };
      }

      const validTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];
      if (!validTypes.includes(row['Account Type'])) {
        return {
          valid: false,
          error: `Row ${i + 1}: Invalid Account Type. Must be one of: ${validTypes.join(', ')}`
        };
      }
    }
  }

  return { valid: true };
};
