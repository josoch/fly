const express = require('express');
const router = express.Router();
const Account = require('../models/Account');

// Get all accounts
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const query = { isActive: true };
    
    if (type) {
      query.type = type;
    }
    
    const accounts = await Account.find(query).sort('code');
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new account
router.post('/', async (req, res) => {
  const account = new Account({
    code: req.body.code,
    name: req.body.name,
    type: req.body.type,
    description: req.body.description,
    balance: req.body.balance || 0,
    parentAccount: req.body.parentAccount
  });

  try {
    const newAccount = await account.save();
    res.status(201).json(newAccount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get account by ID
router.get('/:id', async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (account) {
      res.json(account);
    } else {
      res.status(404).json({ message: 'Account not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update account
router.put('/:id', async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (req.body.code) account.code = req.body.code;
    if (req.body.name) account.name = req.body.name;
    if (req.body.type) account.type = req.body.type;
    if (req.body.description) account.description = req.body.description;
    if (req.body.parentAccount) account.parentAccount = req.body.parentAccount;
    if (req.body.isActive !== undefined) account.isActive = req.body.isActive;

    const updatedAccount = await account.save();
    res.json(updatedAccount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update account balance
router.put('/:id/balance', async (req, res) => {
  try {
    const { balance } = req.body;
    const account = await Account.findById(req.params.id);
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    account.balance = Number(balance) || 0;
    await account.save();
    
    res.json(account);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete account (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    account.isActive = false;
    await account.save();
    res.json({ message: 'Account deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
