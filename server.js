const express = require('express');
// const _bodyParser = require('body-parser')
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;
require('dotenv').config()

const stripe = require('stripe')(
  process.env.STRIPE_SECRET_KEY, 
  { apiVersion: '2020-03-02; oxxo_beta=v3' }
);

app.use(express.static(path.join(__dirname, 'build')));

app.get('/express_backend', function (req, res) {
  return res.send({ message: 'Your express backend is connected to react.' });
});

app.post('/payment-intent', async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 2000,
    currency: 'mxn',
    payment_method_types: ['oxxo'],
  });

  console.log('Payment Intent created:')
  console.log(paymentIntent);

  return res.json({ client_secret: paymentIntent.client_secret })
})

app.listen(port, () => console.log(`Listening on port ${port}`));
