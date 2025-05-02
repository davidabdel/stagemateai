// Simple test to verify Stripe API key
require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

console.log('Checking Stripe configuration...');
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('STRIPE_SECRET_KEY length:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0);

try {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
  });
  
  stripe.products.list({ limit: 3 })
    .then(products => {
      console.log('Successfully connected to Stripe!');
      console.log('Products found:', products.data.length);
      console.log('Product IDs:');
      products.data.forEach(product => {
        console.log(`- ${product.id}: ${product.name}`);
      });
    })
    .catch(error => {
      console.error('Error listing products:', error.message);
    });
} catch (error) {
  console.error('Error initializing Stripe:', error.message);
}
