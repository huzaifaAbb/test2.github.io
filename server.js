// Stripe
const stripe = require('stripe')('sk_test_HwiKT91vvDI3OMM5a8n9alLC00JllySMZh')

// Express
const express = require('express');
const app = express();

// Create PaymentItent (Server-side)
const paymentIntent = await stripe.paymentIntents.create({
    amount: 45,
    currency: 'USD',
    metadata: {integration_check: 'accept_a_payment'},
});

app.get('/secret', async(req, res) => {
    const intent = '';
})