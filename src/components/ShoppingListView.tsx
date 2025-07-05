import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Share2, 
  DollarSign, 
  Package, 
  Calendar,
  AlertTriangle,
  Lightbulb,
  ShoppingCart
} from 'lucide-react';
import ProductCard from './DIYProductCard';
import { ShoppingListViewProps, BudgetBreakdown } from '@/lib/types/diy';

const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  projectName,
  projectDescription,
  products,
  budget,
  tips,
  warnings,
  timeline,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['materials', 'tools', 'fixtures'])
  );
  const [showBudgetBreakdown, setShowBudgetBreakdown] = useState(false);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  const categoryOrder = ['materials', 'tools', 'fixtures', 'consumables', 'appliances', 'hardware'];
  const sortedCategories = Object.keys(groupedProducts).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'materials':
        return <Package className="h-5 w-5" />;
      case 'tools':
        return <span className="h-5 w-5 text-lg">🔧</span>;
      case 'fixtures':
        return <span className="h-5 w-5 text-lg">🚿</span>;
      case 'consumables':
        return <span className="h-5 w-5 text-lg">📦</span>;
      case 'appliances':
        return <span className="h-5 w-5 text-lg">⚡</span>;
      case 'hardware':
        return <span className="h-5 w-5 text-lg">🔩</span>;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getCategoryTotal = (category: string) => {
    return groupedProducts[category]?.reduce((sum, product) => {
      const price = parseFloat(product.price.replace(/[^0-9.]/g, ''));
      const quantity = product.quantity || 1;
      return sum + (price * quantity);
    }, 0) || 0;
  };

  const exportShoppingList = () => {
    const csvContent = [
      ['Category', 'Product', 'Quantity', 'Price', 'Retailer', 'URL'],
      ...products.map(product => [
        product.category || 'other',
        product.name,
        product.quantity || 1,
        product.price,
        product.retailer,
        product.url
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_shopping_list.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareShoppingList = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${projectName} - Shopping List`,
          text: `Check out this DIY shopping list for ${projectName}: ${products.length} items, total budget: $${budget.total.toFixed(2)}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const listText = `${projectName}\n\n${projectDescription}\n\nProducts:\n${products.map(p => `- ${p.name}: ${p.price} at ${p.retailer}`).join('\n')}\n\nTotal Budget: $${budget.total.toFixed(2)}`;
    navigator.clipboard.writeText(listText);
  };

  return (
    <div className="bg-light-primary dark:bg-dark-primary rounded-lg border border-light-200 dark:border-dark-200 p-6 w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6 text-[#24A0ED]" />
            <h2 className="text-xl font-bold text-black dark:text-white">
              {projectName}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportShoppingList}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-light-secondary dark:bg-dark-secondary text-black dark:text-white rounded-lg hover:bg-light-200 dark:hover:bg-dark-200 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button 
              onClick={shareShoppingList}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-light-secondary dark:bg-dark-secondary text-black dark:text-white rounded-lg hover:bg-light-200 dark:hover:bg-dark-200 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
        {projectDescription && (
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {projectDescription}
          </p>
        )}
      </div>

      {/* Budget Summary */}
      <div className="mb-6">
        <div 
          className="flex items-center justify-between p-4 bg-light-secondary dark:bg-dark-secondary rounded-lg cursor-pointer hover:bg-light-200 dark:hover:bg-dark-200 transition-colors"
          onClick={() => setShowBudgetBreakdown(!showBudgetBreakdown)}
        >
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-black dark:text-white">
              Total Budget: ${budget.total.toFixed(2)}
            </span>
            {budget.savings > 0 && (
              <span className="text-sm text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                ${budget.savings.toFixed(2)} saved
              </span>
            )}
          </div>
          {showBudgetBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
        
        {showBudgetBreakdown && (
          <div className="mt-2 p-4 bg-light-secondary dark:bg-dark-secondary rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Materials:</span>
                <span className="font-medium">${budget.materials.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tools:</span>
                <span className="font-medium">${budget.tools.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Fixtures:</span>
                <span className="font-medium">${budget.fixtures.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Consumables:</span>
                <span className="font-medium">${budget.consumables.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="font-medium">${budget.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (est):</span>
                <span className="font-medium">${budget.tax.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      {timeline && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-800 dark:text-blue-200">
              Estimated Timeline
            </span>
          </div>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            {timeline}
          </p>
        </div>
      )}

      {/* Product Categories */}
      <div className="space-y-4 mb-6">
        {sortedCategories.map(category => (
          <div key={category} className="border border-light-200 dark:border-dark-200 rounded-lg overflow-hidden">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors"
              onClick={() => toggleCategory(category)}
            >
              <div className="flex items-center space-x-3">
                {getCategoryIcon(category)}
                <span className="font-semibold text-black dark:text-white capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ({groupedProducts[category].length} items)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-black dark:text-white">
                  ${getCategoryTotal(category).toFixed(2)}
                </span>
                {expandedCategories.has(category) ? 
                  <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                }
              </div>
            </div>
            
            {expandedCategories.has(category) && (
              <div className="border-t border-light-200 dark:border-dark-200 p-4 bg-gray-50 dark:bg-gray-900/20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedProducts[category].map((product, index) => (
                    <ProductCard
                      key={`${category}-${index}`}
                      {...product}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tips and Warnings */}
      {(tips && tips.length > 0) || (warnings && warnings.length > 0) ? (
        <div className="space-y-4">
          {tips && tips.length > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  Helpful Tips
                </h3>
              </div>
              <ul className="text-green-700 dark:text-green-300 text-sm space-y-1">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-green-600">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {warnings && warnings.length > 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Important Warnings
                </h3>
              </div>
              <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-yellow-600">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ShoppingListView;