import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with proper error handling
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
});

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe secret key not configured');
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    const { cart, orderData } = await request.json();

    // Validate input data
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { error: 'Invalid cart data' },
        { status: 400 }
      );
    }

    if (!orderData || !orderData.name || !orderData.apartment || !orderData.email) {
      return NextResponse.json(
        { error: 'Missing order information' },
        { status: 400 }
      );
    }

    // Calculate total amount in cents
    const totalAmount = Math.round(
      cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) * 100
    );

    // Validate minimum amount
    if (totalAmount < 50) { // Minimum $0.50
      return NextResponse.json(
        { error: 'Order total too low' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        customerName: orderData.name,
        apartment: orderData.apartment,
        email: orderData.email,
        items: JSON.stringify(cart.map((item: any) => ({
          id: item.id,
          stripeProductId: item.stripeProductId,
          stripePriceId: item.stripePriceId,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })))
      }
    });

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id 
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Handle specific Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Payment error: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
