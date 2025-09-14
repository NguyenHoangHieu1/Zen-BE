import { Body, Controller, Get, Post } from '@nestjs/common';

import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @Get()
  checkout(@Body() body: any) {
    try {
      return this.stripeService.checkout(body);
    } catch (error) {
      return error;
    }
  }
}
