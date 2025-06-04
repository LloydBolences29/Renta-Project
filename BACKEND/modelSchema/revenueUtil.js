// revenueUtils.js
const Tenant = require('../modelSchema/tenantSchema');

/**
 * Calculates a revenue snapshot from tenant data.
 * @returns {Promise<Object>} An object containing month, year, expectedRevenue, collectedRevenue, and outstandingRevenue.
 */
const calculateRevenueSnapshot = async () => {
  // Fetch all tenant records (adjust query if needed)
  const tenants = await Tenant.find({});

  let expectedRevenue = 0;
  let outstandingRevenue = 0;

  // Loop through each tenant record to sum up revenues
  tenants.forEach(tenant => {
    if (tenant.rentAmount) {
      const rent = Number(tenant.rentAmount);
      expectedRevenue += rent;
      // If tenant's payment is pending, add to outstanding revenue
      if (tenant.paymentStatus === "Pending") {
        outstandingRevenue += rent;
      }
    }
  });

  // Collected revenue is the expected revenue minus outstanding revenue
  const collectedRevenue = expectedRevenue - outstandingRevenue;

  // Get current month and year
  const now = new Date();
  const month = now.getMonth() + 1; // JavaScript months are 0-indexed
  const year = now.getFullYear();

  // Return the snapshot object
  return {
    month,
    year,
    expectedRevenue,
    collectedRevenue,
    outstandingRevenue
  };
};

module.exports = { calculateRevenueSnapshot };
