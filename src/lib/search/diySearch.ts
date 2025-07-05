import { MetaSearchAgent } from './metaSearchAgent';
import { 
  diyProjectAnalysisPrompt,
  diyProductIdentificationPrompt,
  diyProductSearchPrompt,
  diyShoppingListGenerationPrompt
} from '../prompts/diyAssistant';
import { 
  ProjectAnalysis, 
  Product, 
  ProductListing, 
  ShoppingList,
  DIYSearchResult,
  PriceExtractionResult
} from '../types/diy';
import { searchSearxng } from '../searxng';
import { priceExtractor } from '../services/priceExtractor';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { Embeddings } from '@langchain/core/embeddings';

interface DIYSearchOptions {
  chatModel: BaseChatModel;
  embeddingModel: Embeddings;
  location?: string;
}

export class DIYSearchAgent extends MetaSearchAgent {
  private location: string;

  constructor(options: DIYSearchOptions) {
    super({
      activeEngines: ['google', 'amazon'],
      queryGeneratorPrompt: '',
      responsePrompt: '',
      rerank: true,
      rerankThreshold: 0.2,
      searchWeb: true,
      summarizer: false,
    });
    
    this.location = options.location || 'United States';
  }

  async search(query: string, chatHistory: any[] = [], systemInstructions?: string): Promise<DIYSearchResult> {
    try {
      // Stage 1: Project Analysis
      const projectAnalysis = await this.analyzeProject(query, chatHistory, systemInstructions);
      
      // Stage 2: Product Identification
      const products = await this.identifyProducts(projectAnalysis);
      
      // Stage 3: Multi-Source Product Search
      const productListings = await this.searchProducts(products);
      
      // Stage 4: Generate Shopping List
      const shoppingList = await this.generateShoppingList(
        projectAnalysis,
        productListings,
        systemInstructions
      );
      
      return {
        type: 'shopping-list',
        data: shoppingList,
        sources: this.extractSources(productListings)
      };
    } catch (error) {
      console.error('DIY Search Error:', error);
      throw error;
    }
  }

  private async analyzeProject(
    query: string, 
    chatHistory: any[], 
    systemInstructions?: string
  ): Promise<ProjectAnalysis> {
    const prompt = diyProjectAnalysisPrompt
      .replace('{query}', query)
      .replace('{chat_history}', JSON.stringify(chatHistory))
      .replace('{date}', new Date().toISOString());

    // Use the chat model to analyze the project
    const analysis = await this.generateResponse(prompt);
    
    // Parse the analysis into structured format
    return this.parseProjectAnalysis(analysis);
  }

  private async identifyProducts(projectAnalysis: ProjectAnalysis): Promise<Product[]> {
    const prompt = diyProductIdentificationPrompt
      .replace('{project_analysis}', JSON.stringify(projectAnalysis))
      .replace('{date}', new Date().toISOString());

    const productList = await this.generateResponse(prompt);
    
    return this.parseProductList(productList);
  }

  private async searchProducts(products: Product[]): Promise<ProductListing[]> {
    const listings: ProductListing[] = [];
    
    // Search for each product across multiple retailers
    for (const product of products) {
      const searchQueries = this.generateSearchQueries(product);
      
      for (const query of searchQueries) {
        try {
          const results = await searchSearxng(query, {
            engines: ['google', 'amazon', 'google shopping', 'home depot', 'lowes'],
            categories: ['shopping'],
            pageno: 1,
            time_range: '',
            language: 'en',
            safesearch: 0
          });
          
          // Use the price extraction service
          const productListings = await priceExtractor.extractPrices(results, product);
          listings.push(...productListings);
        } catch (error) {
          console.error(`Error searching for ${product.name}:`, error);
        }
      }
    }
    
    return this.deduplicateAndRankListings(listings);
  }

  private async generateShoppingList(
    projectAnalysis: ProjectAnalysis,
    productListings: ProductListing[],
    systemInstructions?: string
  ): Promise<ShoppingList> {
    const prompt = diyShoppingListGenerationPrompt
      .replace('{project_details}', JSON.stringify(projectAnalysis))
      .replace('{products_with_prices}', JSON.stringify(productListings))
      .replace('{systemInstructions}', systemInstructions || '');

    const shoppingListResponse = await this.generateResponse(prompt);
    
    return this.parseShoppingList(shoppingListResponse, productListings);
  }

  // Helper methods for parsing and data transformation
  private parseProjectAnalysis(analysis: string): ProjectAnalysis {
    // Parse LLM response into ProjectAnalysis structure
    // This is a simplified implementation - in practice, you'd use more robust parsing
    try {
      const lines = analysis.split('\n');
      return {
        projectType: this.extractValue(lines, 'project type', 'general renovation'),
        scope: this.extractScope(lines),
        areas: this.extractList(lines, 'areas'),
        skillLevel: this.extractSkillLevel(lines),
        specialRequirements: this.extractList(lines, 'requirements'),
        existingConditions: this.extractList(lines, 'conditions')
      };
    } catch (error) {
      console.error('Error parsing project analysis:', error);
      return {
        projectType: 'general renovation',
        scope: 'partial',
        areas: ['unknown'],
        skillLevel: 'intermediate',
        specialRequirements: [],
        existingConditions: []
      };
    }
  }

  private parseProductList(productList: string): Product[] {
    // Parse LLM response into Product array
    // This is a simplified implementation
    const products: Product[] = [];
    
    try {
      const lines = productList.split('\n');
      let currentProduct: Partial<Product> = {};
      
      for (const line of lines) {
        if (line.includes('Product:') || line.includes('Item:')) {
          if (currentProduct.name) {
            products.push(this.completeProduct(currentProduct));
          }
          currentProduct = {
            name: line.replace(/Product:|Item:/, '').trim(),
            category: 'materials',
            specifications: {},
            quantity: 1,
            unit: 'each',
            alternatives: [],
            essentialFor: []
          };
        }
        // Add more parsing logic here
      }
      
      if (currentProduct.name) {
        products.push(this.completeProduct(currentProduct));
      }
    } catch (error) {
      console.error('Error parsing product list:', error);
    }
    
    return products;
  }

  private generateSearchQueries(product: Product): string[] {
    // Generate multiple search queries for better coverage
    const queries: string[] = [
      `${product.name} ${product.specifications.brand || ''} price`,
      `buy ${product.name} online`,
      `${product.name} Home Depot Lowes`,
    ];
    
    return queries;
  }

  private async extractProductListings(
    searchResults: any[], 
    product: Product
  ): Promise<ProductListing[]> {
    // Extract price, availability, and other details from search results
    const listings: ProductListing[] = [];
    
    for (const result of searchResults) {
      if (this.isProductListing(result)) {
        const listing = await this.parseProductListing(result, product);
        if (listing) {
          listings.push(listing);
        }
      }
    }
    
    return listings;
  }

  private isProductListing(result: any): boolean {
    // Check if search result contains product information
    return result.url && (
      result.url.includes('homedepot.com') ||
      result.url.includes('lowes.com') ||
      result.url.includes('amazon.com') ||
      result.url.includes('wayfair.com') ||
      result.title?.toLowerCase().includes('price') ||
      result.snippet?.includes('$')
    );
  }

  private async parseProductListing(
    result: any, 
    product: Product
  ): Promise<ProductListing | null> {
    // Extract price and other details from search result
    try {
      const priceMatch = result.snippet?.match(/\$[\d,]+\.?\d*/);
      const price = priceMatch ? parseFloat(priceMatch[0].replace(/[\$,]/g, '')) : 0;
      
      if (price === 0) return null;
      
      return {
        product,
        retailer: this.extractRetailer(result.url),
        price,
        currency: 'USD',
        availability: 'in-stock',
        url: result.url,
        shipping: {
          cost: 0,
          estimatedDays: 3
        },
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error parsing product listing:', error);
      return null;
    }
  }

  private deduplicateAndRankListings(listings: ProductListing[]): ProductListing[] {
    // Remove duplicates and rank by relevance, price, availability
    const unique = new Map<string, ProductListing>();
    
    for (const listing of listings) {
      const key = `${listing.product.name}-${listing.retailer}`;
      if (!unique.has(key) || listing.price < unique.get(key)!.price) {
        unique.set(key, listing);
      }
    }
    
    return Array.from(unique.values()).sort((a, b) => {
      // Prioritize in-stock items with good prices
      if (a.availability === 'in-stock' && b.availability !== 'in-stock') return -1;
      if (a.availability !== 'in-stock' && b.availability === 'in-stock') return 1;
      return a.price - b.price;
    });
  }

  private parseShoppingList(
    response: string, 
    productListings: ProductListing[]
  ): ShoppingList {
    // Parse the LLM response into a structured ShoppingList
    return {
      projectName: 'DIY Project',
      projectDescription: response.substring(0, 200),
      products: productListings,
      totalBudget: this.calculateBudget(productListings),
      timeline: {
        totalDuration: '1-2 weeks',
        phases: [],
        criticalPath: []
      },
      instructions: [],
      warnings: [],
      tips: []
    };
  }

  private extractSources(productListings: ProductListing[]): any[] {
    // Extract unique sources from product listings
    const sources = new Map<string, any>();
    
    for (const listing of productListings) {
      if (!sources.has(listing.retailer)) {
        sources.set(listing.retailer, {
          name: listing.retailer,
          url: listing.url,
          type: 'retailer'
        });
      }
    }
    
    return Array.from(sources.values());
  }

  // Utility methods
  private extractValue(lines: string[], key: string, defaultValue: string): string {
    const line = lines.find(l => l.toLowerCase().includes(key.toLowerCase()));
    return line ? line.split(':')[1]?.trim() || defaultValue : defaultValue;
  }

  private extractScope(lines: string[]): 'full' | 'partial' | 'repair' | 'upgrade' {
    const scopeLine = lines.find(l => l.toLowerCase().includes('scope'));
    if (scopeLine?.toLowerCase().includes('full')) return 'full';
    if (scopeLine?.toLowerCase().includes('repair')) return 'repair';
    if (scopeLine?.toLowerCase().includes('upgrade')) return 'upgrade';
    return 'partial';
  }

  private extractList(lines: string[], key: string): string[] {
    const line = lines.find(l => l.toLowerCase().includes(key.toLowerCase()));
    if (!line) return [];
    return line.split(':')[1]?.split(',').map(s => s.trim()) || [];
  }

  private extractSkillLevel(lines: string[]): 'beginner' | 'intermediate' | 'advanced' {
    const skillLine = lines.find(l => l.toLowerCase().includes('skill'));
    if (skillLine?.toLowerCase().includes('beginner')) return 'beginner';
    if (skillLine?.toLowerCase().includes('advanced')) return 'advanced';
    return 'intermediate';
  }

  private completeProduct(partial: Partial<Product>): Product {
    return {
      name: partial.name || '',
      category: partial.category || 'materials',
      specifications: partial.specifications || {},
      quantity: partial.quantity || 1,
      unit: partial.unit || 'each',
      alternatives: partial.alternatives || [],
      essentialFor: partial.essentialFor || []
    };
  }

  private extractRetailer(url: string): string {
    if (url.includes('homedepot.com')) return 'Home Depot';
    if (url.includes('lowes.com')) return 'Lowe\'s';
    if (url.includes('amazon.com')) return 'Amazon';
    if (url.includes('wayfair.com')) return 'Wayfair';
    return 'Unknown Retailer';
  }

  private calculateBudget(listings: ProductListing[]) {
    const total = listings.reduce((sum, listing) => sum + listing.price, 0);
    return {
      materials: total * 0.6,
      tools: total * 0.2,
      fixtures: total * 0.15,
      consumables: total * 0.05,
      shipping: total * 0.1,
      tax: total * 0.08,
      total: total * 1.18,
      savings: 0
    };
  }

  private async generateResponse(prompt: string): Promise<string> {
    // This would use the actual chat model - simplified for now
    return prompt; // Placeholder
  }
}