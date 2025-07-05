export interface Product {
  name: string;
  category: 'tools' | 'materials' | 'fixtures' | 'consumables' | 'appliances' | 'hardware';
  specifications: Record<string, string>;
  quantity: number;
  unit: string;
  alternatives: Product[];
  essentialFor: string[];
}

export interface ShippingInfo {
  cost: number;
  estimatedDays: number;
  freeShippingThreshold?: number;
}

export interface ProductListing {
  product: Product;
  retailer: string;
  retailerLogo?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  availability: 'in-stock' | 'limited' | 'out-of-stock' | 'special-order';
  url: string;
  shipping: ShippingInfo;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  lastUpdated: Date;
}

export interface BudgetBreakdown {
  materials: number;
  tools: number;
  fixtures: number;
  consumables: number;
  shipping: number;
  tax: number;
  total: number;
  savings: number;
}

export interface ProjectPhase {
  name: string;
  description: string;
  products: string[];
  estimatedDuration: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional';
}

export interface ProjectTimeline {
  totalDuration: string;
  phases: ProjectPhase[];
  criticalPath: string[];
}

export interface ShoppingList {
  projectName: string;
  projectDescription: string;
  products: ProductListing[];
  totalBudget: BudgetBreakdown;
  timeline: ProjectTimeline;
  instructions: string[];
  warnings: string[];
  tips: string[];
}

export interface ProjectAnalysis {
  projectType: string;
  scope: 'full' | 'partial' | 'repair' | 'upgrade';
  areas: string[];
  budgetRange?: {
    min: number;
    max: number;
  };
  timelineExpectation?: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  specialRequirements: string[];
  existingConditions: string[];
}

// UI Component Types
export interface DIYProductCardProps {
  name: string;
  price: string;
  originalPrice?: string;
  retailer: string;
  url: string;
  rating?: number;
  reviewCount?: number;
  availability: 'in-stock' | 'limited' | 'out-of-stock' | 'special-order';
  imageUrl?: string;
  shippingInfo?: {
    cost: number;
    estimatedDays: number;
    freeShippingThreshold?: number;
  };
  category?: string;
  specifications?: Record<string, string>;
  quantity?: number;
  unit?: string;
}

export interface ShoppingListViewProps {
  projectName: string;
  projectDescription: string;
  products: DIYProductCardProps[];
  budget: BudgetBreakdown;
  tips?: string[];
  warnings?: string[];
  timeline?: string;
}

// Search Result Types
export interface DIYSearchResult {
  type: 'shopping-list';
  data: ShoppingList;
  sources: Array<{
    name: string;
    url: string;
    type: 'retailer' | 'guide' | 'reference';
  }>;
}

// API Response Types
export interface PriceExtractionResult {
  success: boolean;
  products: ProductListing[];
  errors: string[];
}

export interface ProjectAnalysisResult {
  analysis: ProjectAnalysis;
  confidence: number;
  suggestions: string[];
}