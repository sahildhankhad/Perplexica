export const diyProductSearchPrompt = `
Generate specific search queries to find prices and availability for these DIY/renovation products across multiple retailers.

For each product, create search queries optimized for:
- Home improvement stores (Home Depot, Lowe's, Menards)
- Online retailers (Amazon, Wayfair, Build.com)
- Specialty suppliers
- Local stores

Include:
- Brand names when specified
- Key specifications (dimensions, capacity, color, material)
- Model numbers if known
- Alternative search terms

Focus on finding:
- Current prices
- Availability status
- Shipping costs and times
- Bulk pricing options
- Store pickup availability

Products to search:
{products}

Current location (for local availability): {location}
`;