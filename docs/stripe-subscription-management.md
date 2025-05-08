# Stripe Subscription Management Documentation

This document provides a comprehensive guide to the Stripe subscription management system implemented in StageMate AI. It covers the subscription creation, management, and cancellation processes, as well as common issues and their solutions.

## Table of Contents
1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [Subscription Creation Process](#subscription-creation-process)
4. [Subscription Cancellation Process](#subscription-cancellation-process)
5. [Common Issues and Solutions](#common-issues-and-solutions)
6. [Debugging Guide](#debugging-guide)

## System Overview

The subscription management system integrates with Stripe to handle payments and subscription lifecycle. The system consists of several key components:

- **Frontend Components**: User interface for subscription management
- **API Endpoints**: Backend routes for handling subscription operations
- **Database Tables**: Storage for user, customer, and subscription data
- **Stripe Integration**: Direct API calls to Stripe for subscription operations

## Database Schema

### Key Tables

1. **stripe_customers**
   - `user_id`: Foreign key to the users table
   - `customer_id`: Stripe customer ID
   - `email`: User's email
   - `subscription_id`: Stripe subscription ID
   - `created_at`: Timestamp

2. **user_usage**
   - `user_id`: Foreign key to the users table
   - `photos_used`: Number of photos used
   - `photos_limit`: Maximum number of photos allowed
   - `plan_type`: Subscription plan type (trial, pro, agency, etc.)
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

## Subscription Creation Process

1. **User Initiates Subscription**:
   - User selects a plan and proceeds to checkout
   - Frontend creates a Stripe Checkout session

2. **Payment Processing**:
   - User completes payment through Stripe Checkout
   - Stripe redirects to the success page

3. **Verification and Database Update**:
   - `verify-payment` API endpoint verifies the payment was successful
   - Creates or updates the customer record in `stripe_customers` table
   - Updates the user's plan in the `user_usage` table

4. **Webhook Handling**:
   - `stripe-webhook` endpoint handles Stripe events
   - Processes subscription creation, updates, and cancellations
   - Updates the database with the latest subscription status

### Key Files:
- `src/app/api/verify-payment/route.ts`: Handles payment verification
- `src/app/api/stripe-webhook/route.ts`: Processes Stripe webhooks
- `src/app/api/subscription-status/route.ts`: Checks subscription status

## Subscription Cancellation Process

1. **User Initiates Cancellation**:
   - User clicks "Cancel Subscription" button
   - Frontend sends cancellation request to the API

2. **Backend Processing**:
   - `cancel-subscription` API endpoint receives the request
   - Retrieves the subscription ID from the `stripe_customers` table
   - Calls Stripe API to cancel the subscription
   - Updates the user's plan in the database

3. **Confirmation**:
   - Returns success response to the frontend
   - Frontend updates UI to reflect cancellation

### Key Files:
- `src/app/api/cancel-subscription/route.ts`: Handles subscription cancellation
- `src/app/api/get-stripe-customer/route.ts`: Retrieves customer data including subscription ID

## Common Issues and Solutions

### 1. Subscription ID Not Found

**Symptoms**: Cancellation fails with "No subscription found" error

**Solution**:
- Check the `stripe_customers` table for the user's subscription ID
- Verify the subscription exists in Stripe Dashboard
- Ensure the subscription ID is properly stored during subscription creation

### 2. Invalid Time Value Error

**Symptoms**: Cancellation fails with "Invalid time value" error

**Solution**:
- This occurs when timestamp handling from Stripe API responses is not properly validated
- Ensure all timestamp conversions are wrapped in try-catch blocks
- Validate that timestamps are numbers before converting to Date objects
- Provide fallbacks for invalid timestamps

**Fixed in**: `src/app/api/cancel-subscription/route.ts`

```typescript
// Safe timestamp handling example
try {
  if ((subscription as any).current_period_end) {
    const timestamp = (subscription as any).current_period_end;
    // Ensure timestamp is a valid number
    if (typeof timestamp === 'number') {
      currentPeriodEnd = new Date(timestamp * 1000);
    } else {
      console.log(`Invalid timestamp: ${timestamp}`);
      currentPeriodEnd = null;
    }
  }
} catch (timeError) {
  console.error('Error processing timestamp:', timeError);
  currentPeriodEnd = null;
}
```

### 3. [object Object] in Subscription ID

**Symptoms**: Subscription ID stored as "[object Object]" in the database

**Solution**:
- This occurs when an object is directly assigned to the subscription_id field
- Ensure proper extraction of the subscription ID string from Stripe responses
- Use JSON.stringify for objects that need to be stored as strings

**Fixed in**: `src/app/api/verify-payment/route.ts` and `src/app/api/stripe-webhook/route.ts`

## Debugging Guide

### Logging

The system includes extensive logging throughout the subscription process. Key log points:

1. **Subscription Creation**:
   - Payment verification logs
   - Customer creation logs
   - Subscription creation logs

2. **Subscription Cancellation**:
   - Customer and subscription ID retrieval logs
   - Subscription status before cancellation
   - Cancellation attempt logs
   - Post-cancellation status logs

### Testing Subscription Cancellation

1. **Prerequisites**:
   - Active subscription in Stripe
   - Subscription ID stored in `stripe_customers` table

2. **Test Process**:
   - Log into the application
   - Navigate to subscription management page
   - Click "Cancel Subscription"
   - Check browser console and server logs for errors
   - Verify subscription status in Stripe Dashboard

### Quick Fixes for Common Issues

1. **Missing Subscription ID**:
   ```sql
   -- Check if subscription_id exists in the table
   SELECT * FROM stripe_customers WHERE user_id = 'user_id_here';
   
   -- Add subscription_id column if it doesn't exist
   ALTER TABLE stripe_customers ADD COLUMN subscription_id TEXT;
   ```

2. **Update Existing Customer with Subscription ID**:
   ```javascript
   // Use this code to update existing customers with their subscription IDs
   const { data: customers } = await stripe.customers.list();
   for (const customer of customers.data) {
     const subscriptions = await stripe.subscriptions.list({
       customer: customer.id
     });
     
     if (subscriptions.data.length > 0) {
       await supabase
         .from('stripe_customers')
         .update({ subscription_id: subscriptions.data[0].id })
         .eq('customer_id', customer.id);
     }
   }
   ```

## Maintenance Recommendations

1. **Regular Backups**:
   - Backup the `stripe_customers` and `user_usage` tables regularly

2. **Monitoring**:
   - Set up alerts for failed subscription operations
   - Monitor Stripe webhook events for subscription changes

3. **Testing**:
   - Test the subscription cancellation process after any changes to the subscription system
   - Use Stripe test mode for testing new features

---

Last Updated: May 8, 2025
