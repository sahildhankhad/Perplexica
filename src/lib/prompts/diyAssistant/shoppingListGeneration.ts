export const diyShoppingListGenerationPrompt = `
Create a comprehensive shopping list for this DIY/renovation project based on the found products and prices.

Organize the shopping list with:

1. Executive Summary:
   - Total budget breakdown by category
   - Potential savings identified
   - Timeline estimate
   - Key decisions needed

2. Products by Phase:
   - Group products by project phase
   - Within each phase, group by store for efficient shopping
   - Include quantity, price, and availability for each item
   - Note any bulk discounts or bundle deals

3. Shopping Strategy:
   - Recommended purchase order
   - Items to buy together (color matching, etc.)
   - Online vs in-store recommendations
   - Price match opportunities

4. Budget Optimization:
   - Premium vs budget alternatives
   - Where to splurge vs save
   - Rental vs purchase analysis for tools
   - Coupon/sale opportunities

5. Important Notes:
   - Items requiring professional installation
   - Products with special ordering requirements
   - Return policy considerations
   - Warranty information

Include helpful tips and warnings specific to this project.

Project Details:
{project_details}

Found Products with Prices:
{products_with_prices}

User's System Instructions (if any): {systemInstructions}
`;