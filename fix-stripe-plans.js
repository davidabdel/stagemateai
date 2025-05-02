// Script to fix Stripe plans and update database
require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil',
});

// Initialize Supabase
const supabaseUrl = 'https://bpeoiqffhqszovsnwmjt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZW9pcWZmaHFzem92c253bWp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MzgzNDAsImV4cCI6MjA2MTIxNDM0MH0.6sX-g6DDgaE_MkXwkoremlnB-oQ_7rwLN7XCmwQrao8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('Starting Stripe plans fix...');
  
  try {
    // 1. Check existing products
    console.log('Checking existing Stripe products...');
    const existingProducts = await stripe.products.list({ limit: 10 });
    console.log(`Found ${existingProducts.data.length} products in Stripe`);
    
    // 2. Check existing prices
    console.log('Checking existing Stripe prices...');
    const existingPrices = await stripe.prices.list({ limit: 10 });
    console.log(`Found ${existingPrices.data.length} prices in Stripe`);
    
    // 3. Check existing subscription plans in database
    console.log('Checking existing subscription plans in Supabase...');
    const { data: existingPlans, error } = await supabase
      .from('subscription_plans')
      .select('*');
      
    if (error) {
      console.error('Error fetching subscription plans:', error);
      return;
    }
    
    console.log(`Found ${existingPlans?.length || 0} subscription plans in Supabase`);
    console.log('Existing plans:', existingPlans);
    
    // 4. Create or update products and prices
    console.log('Creating/updating Stripe products and prices...');
    
    // Standard Plan
    let standardProduct = existingProducts.data.find(p => p.name === 'Standard Plan');
    if (!standardProduct) {
      console.log('Creating Standard Plan product...');
      standardProduct = await stripe.products.create({
        name: 'Standard Plan',
        description: '50 AI photo transformations, high resolution images, priority email support',
      });
      console.log('Created Standard Plan product:', standardProduct.id);
    }
    
    // Check for recurring price for Standard Plan
    let standardPrice = existingPrices.data.find(p => 
      p.product === standardProduct.id && 
      p.recurring && 
      p.recurring.interval === 'month' &&
      p.unit_amount === 9900
    );
    
    if (!standardPrice) {
      console.log('Creating Standard Plan recurring price...');
      try {
        standardPrice = await stripe.prices.create({
          product: standardProduct.id,
          unit_amount: 9900,
          currency: 'usd',
          recurring: {
            interval: 'month',
          },
        });
        console.log('Created Standard Plan price:', standardPrice.id);
      } catch (err) {
        console.error('Error creating Standard Plan price:', err.message);
      }
    }
    
    // Agency Plan
    let agencyProduct = existingProducts.data.find(p => p.name === 'Agency Plan');
    if (!agencyProduct) {
      console.log('Creating Agency Plan product...');
      agencyProduct = await stripe.products.create({
        name: 'Agency Plan',
        description: '300 AI photo transformations, high resolution images, priority support',
      });
      console.log('Created Agency Plan product:', agencyProduct.id);
    }
    
    // Check for recurring price for Agency Plan
    let agencyPrice = existingPrices.data.find(p => 
      p.product === agencyProduct.id && 
      p.recurring && 
      p.recurring.interval === 'month' &&
      p.unit_amount === 39700
    );
    
    if (!agencyPrice) {
      console.log('Creating Agency Plan recurring price...');
      try {
        agencyPrice = await stripe.prices.create({
          product: agencyProduct.id,
          unit_amount: 39700,
          currency: 'usd',
          recurring: {
            interval: 'month',
          },
        });
        console.log('Created Agency Plan price:', agencyPrice.id);
      } catch (err) {
        console.error('Error creating Agency Plan price:', err.message);
      }
    }
    
    // 5. Update or create subscription plans in database
    if (existingPlans && existingPlans.length > 0) {
      console.log('Updating existing subscription plans in Supabase...');
      
      // Update Standard Plan
      if (standardPrice) {
        const standardPlan = existingPlans.find(p => p.name === 'Standard' || p.name === 'Standard Plan');
        if (standardPlan) {
          const { error: updateError } = await supabase
            .from('subscription_plans')
            .update({ stripe_price_id: standardPrice.id })
            .eq('id', standardPlan.id);
            
          if (updateError) {
            console.error('Error updating Standard Plan:', updateError);
          } else {
            console.log(`Updated Standard Plan with price ID: ${standardPrice.id}`);
          }
        }
      }
      
      // Update Agency Plan
      if (agencyPrice) {
        const agencyPlan = existingPlans.find(p => p.name === 'Agency' || p.name === 'Agency Plan');
        if (agencyPlan) {
          const { error: updateError } = await supabase
            .from('subscription_plans')
            .update({ stripe_price_id: agencyPrice.id })
            .eq('id', agencyPlan.id);
            
          if (updateError) {
            console.error('Error updating Agency Plan:', updateError);
          } else {
            console.log(`Updated Agency Plan with price ID: ${agencyPrice.id}`);
          }
        }
      }
    } else {
      console.log('Creating new subscription plans in Supabase...');
      
      // Create Standard Plan
      if (standardPrice) {
        const { error: insertError } = await supabase
          .from('subscription_plans')
          .insert([{
            name: 'Standard Plan',
            description: 'Standard subscription plan',
            price: 99,
            credits: 50,
            features: ['50 AI photo transformations', 'High resolution images', 'Priority email support'],
            is_active: true,
            stripe_price_id: standardPrice.id
          }]);
          
        if (insertError) {
          console.error('Error creating Standard Plan:', insertError);
        } else {
          console.log(`Created Standard Plan with price ID: ${standardPrice.id}`);
        }
      }
      
      // Create Agency Plan
      if (agencyPrice) {
        const { error: insertError } = await supabase
          .from('subscription_plans')
          .insert([{
            name: 'Agency Plan',
            description: 'Agency subscription plan',
            price: 397,
            credits: 300,
            features: ['300 AI photo transformations', 'High resolution images', 'Priority support'],
            is_active: true,
            stripe_price_id: agencyPrice.id
          }]);
          
        if (insertError) {
          console.error('Error creating Agency Plan:', insertError);
        } else {
          console.log(`Created Agency Plan with price ID: ${agencyPrice.id}`);
        }
      }
    }
    
    console.log('Stripe plans fix completed!');
    
  } catch (error) {
    console.error('Error fixing Stripe plans:', error.message);
  }
}

main();
