const initialAccounts = [
  // Asset Accounts (1000-1999)
  {
    code: '1000',
    name: 'Assets',
    type: 'Asset',
    description: 'Parent account for all assets'
  },
  {
    code: '1001',
    name: 'Cash in Bank',
    type: 'Asset',
    description: 'Bank account balances'
  },
  {
    code: '1002',
    name: 'Petty Cash',
    type: 'Asset',
    description: 'Small cash on hand for minor expenses'
  },
  {
    code: '1100',
    name: 'Accounts Receivable',
    type: 'Asset',
    description: 'Money owed by customers'
  },
  
  // Liability Accounts (2000-2999)
  {
    code: '2000',
    name: 'Liabilities',
    type: 'Liability',
    description: 'Parent account for all liabilities'
  },
  {
    code: '2001',
    name: 'Accounts Payable',
    type: 'Liability',
    description: 'Money owed to suppliers'
  },
  
  // Equity Accounts (3000-3999)
  {
    code: '3000',
    name: 'Equity',
    type: 'Equity',
    description: 'Parent account for all equity accounts'
  },
  {
    code: '3001',
    name: 'Owner\'s Capital',
    type: 'Equity',
    description: 'Owner\'s investment in the business'
  },
  
  // Revenue Accounts (4000-4999)
  {
    code: '4000',
    name: 'Revenue',
    type: 'Revenue',
    description: 'Parent account for all revenue'
  },
  {
    code: '4001',
    name: 'Sales Revenue',
    type: 'Revenue',
    description: 'Income from sales'
  },
  {
    code: '4002',
    name: 'Service Revenue',
    type: 'Revenue',
    description: 'Income from services'
  },
  
  // Expense Accounts (5000-5999)
  {
    code: '5000',
    name: 'Expenses',
    type: 'Expense',
    description: 'Parent account for all expenses'
  },
  {
    code: '5001',
    name: 'Rent Expense',
    type: 'Expense',
    description: 'Monthly rent payments'
  },
  {
    code: '5002',
    name: 'Utilities Expense',
    type: 'Expense',
    description: 'Electricity, water, etc.'
  },
  {
    code: '5003',
    name: 'Salaries Expense',
    type: 'Expense',
    description: 'Employee salaries'
  }
];

module.exports = initialAccounts;
