const express = require('express');
const router = express.Router();

// Public - no login required. Lets the frontend display payment instructions
// (bank details, fee) without hardcoding them, so you can change them anytime
// in Render's Environment tab without touching code.
router.get('/', (req, res) => {
  res.json({
    certificateFee: process.env.CERTIFICATE_FEE || '5000',
    bankName: process.env.BANK_NAME || 'Not set - add BANK_NAME in Render environment variables',
    bankAccountNumber: process.env.BANK_ACCOUNT_NUMBER || 'Not set - add BANK_ACCOUNT_NUMBER in Render environment variables',
    bankAccountName: process.env.BANK_ACCOUNT_NAME || 'Not set - add BANK_ACCOUNT_NAME in Render environment variables'
  });
});

module.exports = router;
