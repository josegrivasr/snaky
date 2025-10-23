import { useState, useEffect } from 'react';
import { Product } from '../../types';

// Helper function to preload images
const preloadImages = (products: Product[]) => {
  products.forEach(product => {
    if (product.image && product.image.startsWith('http')) {
      const img = new Image();
      img.src = product.image;
      // Don't need to handle onload/onerror here as individual components will handle it
    }
  });
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response not ok:', errorText);
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          console.error('Error in response:', data.error);
          throw new Error(data.error);
        }
        
        const fetchedProducts = data.products || [];
        setProducts(fetchedProducts);
        
        // Preload images for better user experience
        preloadImages(fetchedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        // Fallback to empty array on error - in production you might want to show cached data
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const refetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const fetchedProducts = data.products || [];
      setProducts(fetchedProducts);
      
      // Preload images for better user experience
      preloadImages(fetchedProducts);
    } catch (err) {
      console.error('Error refetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    refetchProducts
  };
};
