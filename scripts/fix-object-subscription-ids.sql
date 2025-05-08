-- Fix the [object Object] values in the subscription_id column
UPDATE stripe_customers 
SET subscription_id = NULL 
WHERE subscription_id = '[object Object]';
