-- Add subscription_id column to stripe_customers table
ALTER TABLE stripe_customers ADD COLUMN subscription_id TEXT;

-- Add comment to the column
COMMENT ON COLUMN stripe_customers.subscription_id IS 'The Stripe subscription ID associated with this customer';

-- Create an index for faster lookups
CREATE INDEX idx_stripe_customers_subscription_id ON stripe_customers(subscription_id);
