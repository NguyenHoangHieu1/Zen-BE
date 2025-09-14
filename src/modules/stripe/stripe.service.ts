import { Injectable } from '@nestjs/common';

import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe;

  constructor() {
    this.stripe = new Stripe(
      process.env.STRIPE_SECRET,
      {
        apiVersion: '2024-12-18.acacia',
      },
    );
  }

  checkout(body: any) {
    return this.stripe.paymentIntents.create({
      amount: 100,
      currency: 'usd', // set currency
      payment_method_types: ['card'],
    });
  }
}
