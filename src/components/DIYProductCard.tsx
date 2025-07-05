import React from 'react';
import { ExternalLink, Star, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { DIYProductCardProps } from '@/lib/types/diy';

const ProductCard: React.FC<DIYProductCardProps> = ({
  name,
  price,
  originalPrice,
  retailer,
  url,
  rating,
  reviewCount,
  availability,
  imageUrl,
  shippingInfo,
  category,
  specifications,
  quantity,
  unit
}) => {
  const getAvailabilityIcon = () => {
    switch (availability) {
      case 'in-stock':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'limited':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'out-of-stock':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'special-order':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getAvailabilityText = () => {
    switch (availability) {
      case 'in-stock':
        return 'In Stock';
      case 'limited':
        return 'Limited Stock';
      case 'out-of-stock':
        return 'Out of Stock';
      case 'special-order':
        return 'Special Order';
      default:
        return 'Unknown';
    }
  };

  const getAvailabilityColor = () => {
    switch (availability) {
      case 'in-stock':
        return 'text-green-600';
      case 'limited':
        return 'text-yellow-600';
      case 'out-of-stock':
        return 'text-red-600';
      case 'special-order':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatQuantity = () => {
    if (quantity && quantity > 1) {
      return `${quantity} ${unit || 'items'}`;
    }
    return null;
  };

  return (
    <div className="bg-light-primary dark:bg-dark-primary border border-light-200 dark:border-dark-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="flex flex-col space-y-3">
        {/* Product Image */}
        {imageUrl && (
          <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src={imageUrl}
              alt={name}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Product Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-black dark:text-white line-clamp-2 flex-1 mr-2">
              {name}
            </h3>
            {category && (
              <span className="px-2 py-1 text-xs bg-light-secondary dark:bg-dark-secondary text-black/70 dark:text-white/70 rounded-full whitespace-nowrap">
                {category}
              </span>
            )}
          </div>

          {/* Quantity */}
          {formatQuantity() && (
            <div className="mb-2">
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Qty: {formatQuantity()}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg font-bold text-black dark:text-white">
              {price}
            </span>
            {originalPrice && originalPrice !== price && (
              <span className="text-sm text-gray-500 line-through">
                {originalPrice}
              </span>
            )}
          </div>

          {/* Rating */}
          {rating && (
            <div className="flex items-center space-x-1 mb-2">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm text-black dark:text-white">
                {rating.toFixed(1)}
              </span>
              {reviewCount && (
                <span className="text-sm text-gray-500">
                  ({reviewCount.toLocaleString()} reviews)
                </span>
              )}
            </div>
          )}

          {/* Availability */}
          <div className="flex items-center space-x-2 mb-2">
            {getAvailabilityIcon()}
            <span className={`text-sm ${getAvailabilityColor()}`}>
              {getAvailabilityText()}
            </span>
          </div>

          {/* Shipping Info */}
          {shippingInfo && (
            <div className="flex items-center space-x-2 mb-2">
              <Truck className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {shippingInfo.cost === 0 ? 'Free shipping' : `$${shippingInfo.cost} shipping`}
                {shippingInfo.estimatedDays > 0 && ` • ${shippingInfo.estimatedDays} days`}
              </span>
            </div>
          )}

          {/* Specifications */}
          {specifications && Object.keys(specifications).length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {Object.entries(specifications).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
                {Object.keys(specifications).length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{Object.keys(specifications).length - 3} more specs
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Retailer and Action */}
        <div className="flex items-center justify-between pt-2 border-t border-light-200 dark:border-dark-200">
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {retailer}
            </span>
            {availability === 'out-of-stock' && (
              <span className="text-xs text-red-500">Check availability</span>
            )}
          </div>
          <div className="flex space-x-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                availability === 'out-of-stock'
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  : 'bg-[#24A0ED] text-white hover:bg-[#1e8bc3]'
              }`}
            >
              <span>{availability === 'out-of-stock' ? 'Check' : 'View'}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;