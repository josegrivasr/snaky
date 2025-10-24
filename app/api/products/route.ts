import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with production keys
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
});

export async function GET(request: NextRequest) {
  try {
    // Check if Stripe key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Fetch ALL products (both active and inactive) to ensure we don't miss any
    let allProducts: Stripe.Product[] = [];
    let hasMore = true;
    let startingAfter: string | undefined = undefined;

    // Handle pagination to get all products
    while (hasMore) {
      const productsResponse: Stripe.ApiList<Stripe.Product> = await stripe.products.list({
        limit: 100,
        starting_after: startingAfter,
        expand: ['data.default_price']
      });
      
      allProducts = allProducts.concat(productsResponse.data);
      hasMore = productsResponse.has_more;
      if (hasMore && productsResponse.data.length > 0) {
        startingAfter = productsResponse.data[productsResponse.data.length - 1].id;
      }
    }

    // Fetch all prices to get complete pricing information
    let allPrices: Stripe.Price[] = [];
    hasMore = true;
    startingAfter = undefined;

    while (hasMore) {
      const pricesResponse: Stripe.ApiList<Stripe.Price> = await stripe.prices.list({
        limit: 100,
        starting_after: startingAfter,
        expand: ['data.product']
      });
      
      allPrices = allPrices.concat(pricesResponse.data);
      hasMore = pricesResponse.has_more;
      if (hasMore && pricesResponse.data.length > 0) {
        startingAfter = pricesResponse.data[pricesResponse.data.length - 1].id;
      }
    }

    // Transform Stripe data to match our schema
    const transformedProducts = allProducts.map((product, index) => {
      // Try multiple ways to find the price for this product
      let defaultPrice = null;
      
      // Method 1: Use the default_price from the product
      if (product.default_price && typeof product.default_price === 'object') {
        defaultPrice = product.default_price;
      } else {
        // Method 2: Find price by product ID in prices list
        defaultPrice = allPrices.find(price => 
          price.product === product.id && price.active
        );
      }

      // Get stock and position from metadata
      const stock = parseInt(product.metadata?.stock || '10'); // Default to 10 if no stock set
      const position = product.metadata?.position || `A${index + 1}`; // Default position if none set

      return {
        id: product.id, // Use Stripe product ID
        stripeProductId: product.id,
        stripePriceId: defaultPrice?.id || '',
        name: product.name,
        description: product.description || '',
        price: defaultPrice ? (defaultPrice.unit_amount || 0) / 100 : 2.00, // Default to $2.00 if no price
        stock: stock,
        image: product.images?.[0] || product.metadata?.image || '🛍️', // Use first image or fallback
        position: position,
        currency: defaultPrice?.currency || 'usd',
        active: product.active
      };
    });
    
    // Filter products - show active products and products with stock > 0
    const filteredProducts = transformedProducts.filter(product => {
      // Show product if it's active OR if it has stock (in case you want to show out-of-stock items)
      return product.active && product.stock > 0;
    });

    // Sort products by position for consistent ordering
    filteredProducts.sort((a, b) => {
      // Extract numbers from position (e.g., "A1" -> 1, "B2" -> 2)
      const getPositionNumber = (pos: string) => {
        const match = pos.match(/(\d+)/);
        return match ? parseInt(match[1]) : 999;
      };
      return getPositionNumber(a.position) - getPositionNumber(b.position);
    });

    // Log for debugging
    
    return NextResponse.json({ 
      products: filteredProducts,
      count: filteredProducts.length,
      totalFetched: allProducts.length
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
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}