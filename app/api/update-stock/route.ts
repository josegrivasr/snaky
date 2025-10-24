import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with production keys
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
});

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const { productId, quantityPurchased } = await request.json();

    // Validate input data
    if (!productId || !quantityPurchased || quantityPurchased <= 0) {
      return NextResponse.json(
        { error: 'Invalid product ID or quantity' },
        { status: 400 }
      );
    }

    // Get the current product to check current stock
    const product = await stripe.products.retrieve(productId);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get current stock from metadata
    const currentStock = parseInt(product.metadata?.stock || '0');
    
    // Calculate new stock
    const newStock = Math.max(0, currentStock - quantityPurchased);

    // Update the product with new stock in metadata
    const updatedProduct = await stripe.products.update(productId, {
      metadata: {
        ...product.metadata,
        stock: newStock.toString()
      }
    });

    return NextResponse.json({ 
      success: true,
      productId: productId,
      previousStock: currentStock,
      quantityPurchased: quantityPurchased,
      newStock: newStock,
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        stock: newStock
      }
    });

  } catch (error) {
    
    // Handle specific Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    );
  }
}
