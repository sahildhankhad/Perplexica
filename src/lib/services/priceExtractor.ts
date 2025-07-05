import { ProductListing, Product } from '../types/diy';

interface PriceExtractionOptions {
  cacheTTL?: number; // Time to live in milliseconds
  maxRetries?: number;
  timeout?: number;
}

interface CachedPrice {
  price: number;
  timestamp: number;
  url: string;
  retailer: string;
}

class PriceExtractionService {
  private cache = new Map<string, CachedPrice>();
  private readonly defaultOptions: Required<PriceExtractionOptions> = {
    cacheTTL: 60 * 60 * 1000, // 1 hour
    maxRetries: 3,
    timeout: 10000, // 10 seconds
  };

  constructor(private options: PriceExtractionOptions = {}) {
    this.options = { ...this.defaultOptions, ...options };
  }

  async extractPrices(searchResults: any[], product: Product): Promise<ProductListing[]> {
    const listings: ProductListing[] = [];

    for (const result of searchResults) {
      try {
        const listing = await this.extractSinglePrice(result, product);
        if (listing) {
          listings.push(listing);
        }
      } catch (error) {
        console.error(`Error extracting price from ${result.url}:`, error);
      }
    }

    return this.deduplicateListings(listings);
  }

  private async extractSinglePrice(result: any, product: Product): Promise<ProductListing | null> {
    if (!this.isValidProductResult(result)) {
      return null;
    }

    const cacheKey = `${product.name}-${result.url}`;
    const cached = this.getCachedPrice(cacheKey);
    
    if (cached) {
      return this.createListingFromCache(cached, product);
    }

    const extracted = await this.performPriceExtraction(result, product);
    
    if (extracted) {
      this.cachePrice(cacheKey, extracted);
    }

    return extracted;
  }

  private isValidProductResult(result: any): boolean {
    if (!result.url || !result.title) {
      return false;
    }

    // Check if it's from a known retailer
    const knownRetailers = [
      'homedepot.com',
      'lowes.com',
      'amazon.com',
      'wayfair.com',
      'menards.com',
      'build.com',
      'ferguson.com',
      'acehardware.com'
    ];

    const isKnownRetailer = knownRetailers.some(retailer => 
      result.url.toLowerCase().includes(retailer)
    );

    // Check if the snippet contains price indicators
    const hasPriceIndicators = result.snippet && (
      result.snippet.includes('$') ||
      result.snippet.toLowerCase().includes('price') ||
      result.snippet.toLowerCase().includes('buy') ||
      result.snippet.toLowerCase().includes('sale')
    );

    return isKnownRetailer || hasPriceIndicators;
  }

  private async performPriceExtraction(result: any, product: Product): Promise<ProductListing | null> {
    const retailer = this.extractRetailer(result.url);
    
    // Extract price from snippet first (fastest method)
    let price = this.extractPriceFromSnippet(result.snippet);
    
    // If no price found, try title
    if (!price) {
      price = this.extractPriceFromSnippet(result.title);
    }

    if (!price) {
      return null;
    }

    const availability = this.extractAvailability(result.snippet, result.title);
    const rating = this.extractRating(result.snippet);
    const imageUrl = this.extractImageUrl(result);

    return {
      product,
      retailer,
      price,
      currency: 'USD',
      availability,
      url: result.url,
      shipping: await this.estimateShipping(retailer, price),
      rating: rating?.rating,
      reviewCount: rating?.reviewCount,
      imageUrl,
      lastUpdated: new Date()
    };
  }

  private extractPriceFromSnippet(text: string): number | null {
    if (!text) return null;

    // Multiple price regex patterns
    const pricePatterns = [
      /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, // $1,234.56
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollars?|USD|\$)/gi, // 1234 dollars
      /price[:\s]*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, // Price: $123.45
    ];

    for (const pattern of pricePatterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        // Get the first price found
        const priceStr = matches[0][1];
        const price = parseFloat(priceStr.replace(/,/g, ''));
        
        // Validate price range (between $1 and $10,000 for most DIY items)
        if (price >= 1 && price <= 10000) {
          return price;
        }
      }
    }

    return null;
  }

  private extractAvailability(snippet: string, title: string): ProductListing['availability'] {
    const text = `${snippet} ${title}`.toLowerCase();

    if (text.includes('out of stock') || text.includes('unavailable')) {
      return 'out-of-stock';
    }
    if (text.includes('limited') || text.includes('low stock')) {
      return 'limited';
    }
    if (text.includes('special order') || text.includes('custom order')) {
      return 'special-order';
    }
    
    return 'in-stock'; // Default assumption
  }

  private extractRating(snippet: string): { rating: number; reviewCount: number } | null {
    if (!snippet) return null;

    // Look for rating patterns like "4.5 stars" or "4.5 out of 5"
    const ratingPattern = /(\d+\.?\d*)\s*(?:out of 5|stars?|\★)/i;
    const ratingMatch = snippet.match(ratingPattern);

    // Look for review count patterns like "(123 reviews)"
    const reviewPattern = /\((\d+(?:,\d+)*)\s*reviews?\)/i;
    const reviewMatch = snippet.match(reviewPattern);

    if (ratingMatch || reviewMatch) {
      return {
        rating: ratingMatch ? parseFloat(ratingMatch[1]) : 0,
        reviewCount: reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, '')) : 0
      };
    }

    return null;
  }

  private extractImageUrl(result: any): string | undefined {
    // Extract image URL from result if available
    if (result.img_src) {
      return result.img_src;
    }
    
    // For some search engines, images might be in different fields
    if (result.thumbnail) {
      return result.thumbnail;
    }

    return undefined;
  }

  private async estimateShipping(retailer: string, price: number): Promise<ProductListing['shipping']> {
    // Retailer-specific shipping rules
    const shippingRules: Record<string, { freeThreshold: number; standardCost: number; estimatedDays: number }> = {
      'Home Depot': { freeThreshold: 45, standardCost: 5.99, estimatedDays: 3 },
      'Lowe\'s': { freeThreshold: 45, standardCost: 5.99, estimatedDays: 3 },
      'Amazon': { freeThreshold: 25, standardCost: 4.99, estimatedDays: 2 },
      'Wayfair': { freeThreshold: 35, standardCost: 4.95, estimatedDays: 5 },
      'Menards': { freeThreshold: 49, standardCost: 6.99, estimatedDays: 4 },
    };

    const rule = shippingRules[retailer] || { freeThreshold: 50, standardCost: 5.99, estimatedDays: 3 };

    return {
      cost: price >= rule.freeThreshold ? 0 : rule.standardCost,
      estimatedDays: rule.estimatedDays,
      freeShippingThreshold: rule.freeThreshold
    };
  }

  private extractRetailer(url: string): string {
    const retailerMap: Record<string, string> = {
      'homedepot.com': 'Home Depot',
      'lowes.com': 'Lowe\'s',
      'amazon.com': 'Amazon',
      'wayfair.com': 'Wayfair',
      'menards.com': 'Menards',
      'build.com': 'Build.com',
      'ferguson.com': 'Ferguson',
      'acehardware.com': 'Ace Hardware'
    };

    for (const [domain, name] of Object.entries(retailerMap)) {
      if (url.toLowerCase().includes(domain)) {
        return name;
      }
    }

    // Extract domain name as fallback
    try {
      const hostname = new URL(url).hostname.replace('www.', '');
      return hostname.charAt(0).toUpperCase() + hostname.slice(1);
    } catch {
      return 'Unknown Retailer';
    }
  }

  private getCachedPrice(key: string): CachedPrice | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.options.cacheTTL!;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached;
  }

  private cachePrice(key: string, listing: ProductListing): void {
    this.cache.set(key, {
      price: listing.price,
      timestamp: Date.now(),
      url: listing.url,
      retailer: listing.retailer
    });
  }

  private createListingFromCache(cached: CachedPrice, product: Product): ProductListing {
    return {
      product,
      retailer: cached.retailer,
      price: cached.price,
      currency: 'USD',
      availability: 'in-stock',
      url: cached.url,
      shipping: { cost: 0, estimatedDays: 3 },
      lastUpdated: new Date(cached.timestamp)
    };
  }

  private deduplicateListings(listings: ProductListing[]): ProductListing[] {
    const seen = new Map<string, ProductListing>();

    for (const listing of listings) {
      const key = `${listing.retailer}-${listing.product.name}`;
      const existing = seen.get(key);

      if (!existing || listing.price < existing.price) {
        seen.set(key, listing);
      }
    }

    return Array.from(seen.values()).sort((a, b) => {
      // Sort by availability first, then by price
      if (a.availability === 'in-stock' && b.availability !== 'in-stock') return -1;
      if (a.availability !== 'in-stock' && b.availability === 'in-stock') return 1;
      return a.price - b.price;
    });
  }

  // Public method to clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Public method to get cache stats
  getCacheStats(): { size: number; entries: Array<{ key: string; age: number }> } {
    const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      age: Date.now() - value.timestamp
    }));

    return {
      size: this.cache.size,
      entries
    };
  }
}

// Export singleton instance
export const priceExtractor = new PriceExtractionService();
export default PriceExtractionService;