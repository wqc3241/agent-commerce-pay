import type { Product } from '@/types'

interface TavilyResult {
  title: string
  url: string
  content: string
  score: number
}

interface TavilyResponse {
  results: TavilyResult[]
}

function cleanTitle(title: string): string {
  return title
    .replace(/\s*[-|:]\s*(Amazon\.com|Amazon|Best Buy|Walmart|Target|eBay|Newegg).*$/i, '')
    .replace(/\s*\(.*?\)\s*$/, '')
    .trim()
}

function extractPrice(text: string): number {
  const match = text.match(/\$(\d{1,},?\d*\.?\d{0,2})/)
  if (!match) return 0
  return parseFloat(match[1].replace(',', ''))
}

function extractCategory(title: string, content: string): string {
  const text = `${title} ${content}`.toLowerCase()
  if (/headphone|earbud|speaker|audio|bluetooth/.test(text)) return 'Audio'
  if (/laptop|computer|pc|monitor|keyboard|mouse/.test(text)) return 'Electronics'
  if (/phone|mobile|tablet|ipad/.test(text)) return 'Mobile'
  if (/shirt|dress|shoe|clothing|apparel|jacket|pants/.test(text)) return 'Clothing'
  if (/food|snack|grocery|organic/.test(text)) return 'Food & Grocery'
  if (/home|kitchen|furniture|decor|blanket|candle/.test(text)) return 'Home'
  if (/camera|photo|lens/.test(text)) return 'Camera'
  if (/game|gaming|console|puzzle|toy/.test(text)) return 'Toys & Games'
  if (/book|reading/.test(text)) return 'Books'
  if (/beauty|skincare|makeup|cosmetic/.test(text)) return 'Beauty'
  return 'General'
}

function isProductPage(url: string): boolean {
  // Filter out category/search/listing pages — keep only actual product pages
  if (/amazon\.com.*\/dp\//.test(url)) return true
  if (/amazon\.com.*\/gp\/product\//.test(url)) return true
  if (/walmart\.com\/ip\//.test(url)) return true
  if (/bestbuy\.com\/(site\/|product\/).*\d/.test(url)) return true
  if (/target\.com\/p\//.test(url)) return true
  if (/ebay\.com\/itm\//.test(url)) return true
  // For non-big-retailer URLs, accept them (e.g. jbl.com, direct brand stores)
  if (!/amazon|walmart|bestbuy|target|ebay/.test(url)) return true
  return false
}

/** Search for a specific product by name and find its direct purchase URL */
async function findProductUrl(productName: string): Promise<TavilyResult | null> {
  const apiKey = import.meta.env.VITE_TAVILY_API_KEY
  if (!apiKey) return null

  const response = await fetch('/api/tavily/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query: `buy ${productName}`,
      max_results: 5,
    }),
  })

  if (!response.ok) return null

  const data: TavilyResponse = await response.json()

  // Find the first result that's an actual product page
  const productResult = data.results.find((r) => isProductPage(r.url))
  return productResult || data.results[0] || null
}

/** Search for products by name and resolve direct purchase URLs via Tavily.
 *  Takes an array of product names (from Gemini) and returns Product[] with real URLs. */
export async function resolveProductUrls(
  products: { name: string; price: number; description: string; category: string }[]
): Promise<Product[]> {
  // Search for all products in parallel
  const results = await Promise.all(
    products.map((p) => findProductUrl(p.name))
  )

  return products.map((p, i) => {
    const tavilyResult = results[i]

    return {
      id: `web-${Date.now()}-${i}`,
      name: tavilyResult ? cleanTitle(tavilyResult.title) : p.name,
      description: p.description || (tavilyResult?.content.slice(0, 150) ?? ''),
      price: p.price || (tavilyResult ? extractPrice(tavilyResult.content) || extractPrice(tavilyResult.title) : 0),
      image: '🔍',
      category: p.category || (tavilyResult ? extractCategory(tavilyResult.title, tavilyResult.content) : 'General'),
      inStock: true,
      url: tavilyResult?.url,
      source: 'web' as const,
    }
  })
}
