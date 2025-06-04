const Tenant = require('../modelSchema/tenantSchema');
const Transaction = require('../modelSchema/transactionSchema');

const markTenantAsPaid = async (req, res) => {
    try {
      const { tenantId } = req.params;
      
      // Fetch the tenant by ID
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }
      
      // Only allow normal payment if the paymentStatus is Pending.
      if (tenant.paymentStatus !== 'Pending') {
        return res.status(400).json({
          error: 'Payment already made for the current period. Please use advanced payment if applicable.'
        });
      }
      
      // Calculate new lease end date by adding 1 month
      const newLeaseEndDate = new Date(tenant.leaseEndDate);
      newLeaseEndDate.setMonth(newLeaseEndDate.getMonth() + 1);
      
      // Update the tenant's payment status and lease end date
      tenant.paymentStatus = 'Paid';
      tenant.leaseEndDate = newLeaseEndDate;
      await tenant.save();
      
      // Create a transaction record
      const transaction = new Transaction({
        tenant: tenant._id,
        amount: tenant.rentAmount,
        paymentStatus: 'Paid',
        newLeaseEndDate
      });
      await transaction.save();
      
      res.status(200).json({ success: true, tenant, transaction });
    } catch (error) {
      console.error('Error marking tenant as paid:', error);
      res.status(500).json({ error: 'An error occurred while processing the payment.' });
    }
  };
  

  // get the transaction hsitory of the tenant

const getTransactionsByTenant = async (req, res) => {
    try {
      const { tenantId } = req.query;
      if (!tenantId) {
        return res.status(400).json({ error: 'tenantId query parameter is required' });
      }
  
      // Find transactions for the specified tenant, optionally sort by transactionDate descending
      const transactions = await Transaction.find({ tenant: tenantId }).sort({ transactionDate: -1 });
      return res.status(200).json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };


  // advance payment

  const markTenantAsAdvanced = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
          return res.status(404).json({ error: 'Tenant not found' });
        }
    
        // Only allow advanced payment if the tenant's payment status is already "Paid"
        if (tenant.paymentStatus !== 'Paid') {
          return res.status(400).json({
            error: 'Opps!! Please pay your due this month before doing advanced payment'
          });
        }
    
        // Calculate new lease end date by adding 1 month
        const newLeaseEndDate = new Date(tenant.leaseEndDate);
        newLeaseEndDate.setMonth(newLeaseEndDate.getMonth() + 1);
    
        // Update tenant's lease end date and set payment status to "Advanced"
        tenant.leaseEndDate = newLeaseEndDate;
        tenant.paymentStatus = 'Advanced';
        await tenant.save();
    
        // Create a transaction record for the advanced payment
        const transaction = new Transaction({
          tenant: tenant._id,
          amount: tenant.rentAmount,
          paymentStatus: 'Advanced',
          newLeaseEndDate
        });
        await transaction.save();
    
        res.status(200).json({ success: true, tenant, transaction });
      } catch (error) {
        console.error('Error marking tenant as advanced:', error);
        res.status(500).json({ error: 'An error occurred while processing the advanced payment.' });
      }
    };


module.exports = {
    markTenantAsPaid,
    getTransactionsByTenant,
    markTenantAsAdvanced
}
