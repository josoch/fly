const xlsx = require('xlsx');
const csv = require('csv-parser');
const fs = require('fs');

const processExcel = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};

const processCsv = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

const validateFields = (data, requiredFields) => {
  const errors = [];
  data.forEach((row, index) => {
    requiredFields.forEach(field => {
      if (!row[field]) {
        errors.push(`Row ${index + 1}: Missing required field '${field}'`);
      }
    });
  });
  return errors;
};

const normalizeData = (data) => {
  return data.map(row => {
    const normalized = {};
    Object.keys(row).forEach(key => {
      // Convert header to camelCase and remove special characters
      const normalizedKey = key
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
        .replace(/[^a-zA-Z0-9]/g, '');
      
      // Handle common field name variations
      const keyMap = {
        accountcode: 'accountCode',
        companyname: 'companyName',
        companyregnumber: 'companyRegNumber',
        vatnumber: 'vatNumber',
        companyregistrationnumber: 'companyRegNumber',
        street1: 'street1',
        streetaddress1: 'street1',
        street2: 'street2',
        streetaddress2: 'street2',
        postcode: 'postCode',
        zipcode: 'postCode',
        contactname: 'contactName',
        tradecontact: 'tradeContact',
        email1: 'email1',
        emailaddress: 'email1',
        email2: 'email2',
        secondaryemail: 'email2',
        phonenumber: 'telephone',
        phone: 'telephone',
        mobilenumber: 'mobile',
        mobilephone: 'mobile',
        websiteurl: 'website',
        facebookurl: 'facebook',
        twitterhandle: 'twitter',
      };

      const mappedKey = keyMap[normalizedKey] || normalizedKey;
      normalized[mappedKey] = row[key];
    });

    // Convert specific fields to proper types
    if ('balance' in normalized) {
      normalized.balance = parseFloat(normalized.balance) || 0;
    }
    if ('inactive' in normalized) {
      normalized.inactive = normalized.inactive?.toString().toLowerCase() === 'true';
    }
    if ('sendViaEmail' in normalized) {
      normalized.sendViaEmail = normalized.sendViaEmail?.toString().toLowerCase() === 'true';
    }

    return normalized;
  });
};

const processFile = async (filePath, fileType) => {
  try {
    let data;
    if (fileType === 'csv') {
      data = await processCsv(filePath);
    } else {
      data = await processExcel(filePath);
    }

    // Normalize the data
    const normalizedData = normalizeData(data);

    return normalizedData;
  } catch (error) {
    throw error;
  } finally {
    // Clean up the temporary file
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting temporary file:', err);
    });
  }
};

module.exports = {
  processFile,
  validateFields
};
