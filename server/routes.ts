import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import * as cheerio from "cheerio";
import axios from "axios";
import * as crypto from "crypto";

interface ProductRequest {
  url: string;
  appKey: string;
  appSecret: string;
  trackingId: string;
}

interface OfferItem {
  name: string;
  link: string;
  success: boolean;
}

interface ProductResponse {
  id: string;
  productId: string;
  title: string;
  imageUrl: string | null;
  price: string;
  originalPrice: string;
  discount: string;
  storeName: string;
  evaluateRate: string;
  shopUrl: string;
  categoryName: string;
  commissionRate: string;
  orders: string;
  shipping_fees: string;
  searchedAt: string;
  offers: OfferItem[];
}

const ALIEXPRESS_API_URL = "https://api-sg.aliexpress.com/sync";

function extractProductId(text: string): string | null {
  const urlPattern = /https?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/g;
  const urls = text.match(urlPattern);
  
  const targetUrl = urls?.find(url => 
    url.includes("aliexpress.com") || 
    url.includes("alix.live") || 
    url.includes("s.click.aliexpress.com")
  ) || text;

  // Patterns for specific product ID extraction from URLs
  const urlPatterns = [
    /[?&]productIds?=(\d+)/,
    /\/item\/(\d+)\.(?:html|htm)/,
    /\/item\/(\d+)(?:\?|$)/,
    /\/product\/(\d+)/,
    /\/i\/(\d+)/,
    /\/p\/[^/]+\/index\.html[?&]productIds?=(\d+)/,
    /\/ssr\/.*?[?&]productIds?=(\d+)/,
    /\/[a-z0-9]+\.html\?.*?productId(?:s)?=(\d+)/,
  ];

  for (const pattern of urlPatterns) {
    const match = targetUrl.match(pattern);
    if (match) {
      return match[1];
    }
  }

  // If no URL pattern matches, search for a long numeric string in the entire text
  const numericMatch = text.match(/\b\d{10,20}\b/);
  if (numericMatch) {
    return numericMatch[0];
  }

  return null;
}

async function resolveRedirects(url: string): Promise<string> {
  const urlPattern = /https?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/;
  const match = url.match(urlPattern);
  const cleanUrl = match ? match[0] : url;

  try {
    const response = await fetch(cleanUrl, {
      method: "HEAD",
      redirect: "follow",
    });
    return response.url;
  } catch {
    return cleanUrl;
  }
}

function generateApiSignature(params: Record<string, string>, secret: string): string {
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys.map((key) => `${key}${params[key]}`).join("");
  return crypto
    .createHmac("sha256", secret)
    .update(paramString)
    .digest("hex")
    .toUpperCase();
}

async function getProductDetails(productId: string): Promise<{
  title: string;
  imageUrl: string | null;
}> {
  try {
    const url = `https://www.aliexpress.com/item/${productId}.html`;
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://www.google.com/",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache"
      },
      timeout: 15000
    });

    const $ = cheerio.load(data);

    // Advanced Extraction matching pattern from Offres-365 logic
    let title = "";
    let imageUrl = "";

    // 1. Try JSON extraction from scripts (most reliable)
    const scripts = $('script');
    scripts.each((_, element) => {
      const content = $(element).html() || "";
      if (content.includes('window.runParams')) {
        try {
          const match = content.match(/window\.runParams\s*=\s*(\{.*?\});/);
          if (match) {
            const params = JSON.parse(match[1]);
            const data = params.data || params;
            title = data.productDetailModule?.title || data.titleModule?.subject || data.subject;
            imageUrl = data.imageModule?.imagePathList?.[0] || data.productDetailModule?.imagePathList?.[0];
          }
        } catch (e) {}
      }
    });

    // 2. Fallback to Meta tags
    if (!title) {
      const ogTitle = ($('meta[property="og:title"]').attr('content') as string) || "";
      const twitterTitle = ($('meta[name="twitter:title"]').attr('content') as string) || "";
      title = ogTitle || 
              twitterTitle ||
              $('.product-title-text').first().text().trim() ||
              $('h1').first().text().trim() ||
              $('title').text().trim();
    }

    if (!imageUrl) {
      const ogImage = ($('meta[property="og:image"]').attr('content') as string) || "";
      const twitterImage = ($('meta[name="twitter:image"]').attr('content') as string) || "";
      imageUrl = ogImage ||
                 twitterImage ||
                 $('.magnifier-image').attr('src') ||
                 $('.magnifier-image').attr('data-src') || "";
    }

    // 3. Last resort: first large image
    if (!imageUrl) {
      imageUrl = $('img[src*="kf/"]').first().attr('src');
    }

    // Clean up title
    if (title) {
      title = title.replace(/&amp;/g, '&')
                   .replace(/&quot;/g, '"')
                   .replace(/&lt;/g, '<')
                   .replace(/&gt;/g, '>')
                   .substring(0, 250)
                   .trim();
    }

    // Clean up Image URL
    if (imageUrl) {
      if (imageUrl.startsWith('//')) imageUrl = `https:${imageUrl}`;
      // Remove thumbnail resizing if present
      imageUrl = imageUrl.replace(/_\d+x\d+\.(jpg|png|webp).*/, '');
    }

    return {
      title: title || "AliExpress Product",
      imageUrl: imageUrl || null
    };
  } catch (error) {
    console.error("Scraping Error:", error);
    return { title: "AliExpress Product", imageUrl: null };
  }
}

async function getProductDetailsFromApi(
  productId: string,
  appKey: string,
  appSecret: string,
  trackingId: string
): Promise<{
  title: string;
  price: string;
  originalPrice: string;
  discount: string;
  storeName: string;
  evaluateRate: string;
  shopUrl: string;
  categoryName: string;
  commissionRate: string;
  orders: string;
  imageUrl: string | null;
  shipping_fees: string;
}> {
  try {
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
    const params: Record<string, string> = {
      method: "aliexpress.affiliate.productdetail.get",
      app_key: appKey,
      sign_method: "sha256",
      timestamp,
      format: "json",
      v: "2.0",
      product_ids: productId,
      target_currency: "USD",
      target_language: "EN",
      tracking_id: trackingId,
      country: "DZ",
    };

    params.sign = generateApiSignature(params, appSecret);

    const response = await fetch(ALIEXPRESS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(params).toString(),
    });

    const data = await response.json();

    if (data.error_response) {
      console.error("API Error:", data.error_response);
      throw new Error(data.error_response.msg || "API Error");
    }

    const result =
      data.aliexpress_affiliate_productdetail_get_response?.resp_result?.result;
    const products = result?.products?.product;

    if (!products || products.length === 0) {
      throw new Error("No product data returned");
    }

    const product = Array.isArray(products) ? products[0] : products;

    // Use specific info from the user provided API response structure for shipping and score
    // According to user, shipping_fees and product_score are in different calls/structure
    // But we should try to extract what we can from the available response.
    // The user provided a specific JSON structure:
    // result.result.ae_item_info.product_score
    // result.result.ae_item_sku_info[0].shipping_fees

    const salePrice =
      product.target_sale_price || product.app_sale_price || "N/A";
    const originalPrice =
      product.target_original_price || product.original_price || "N/A";

    let discount = product.target_discount || "";
    if (!discount && originalPrice !== "N/A" && salePrice !== "N/A") {
      try {
        const original = parseFloat(
          originalPrice.toString().replace(/[^0-9.]/g, "")
        );
        const sale = parseFloat(salePrice.toString().replace(/[^0-9.]/g, ""));
        if (original > 0 && sale > 0) {
          discount = `${(((original - sale) / original) * 100).toFixed(1)}%`;
        }
      } catch {
        discount = "";
      }
    }

    let shopUrl = product.shop_url || "N/A";
    if (shopUrl.includes('/store/')) {
        try {
            const storeId = shopUrl.split('/store/')[1].split('/')[0].split('?')[0];
            shopUrl = `https://m.aliexpress.com/store/${storeId}?shopId=${storeId}`;
        } catch (e) {}
    }

    // Extraction of image from API
    const imageUrl = product.product_main_image_url || product.first_image_url || null;

    // Based on user input, we should prioritize product_score and shipping_fees from the structure they provided
    // However, getProductDetailsFromApi uses aliexpress.affiliate.productdetail.get
    // The user's provided JSON seems to be from a different call (ae_item_info)
    // For now, I will update the extraction logic to look for these specific fields if they exist in the response
    
    const evaluateRate = product.product_score || product.evaluate_rate || "N/A";
    const shipping_fees = product.shipping_fees || "Free Shipping";

    return {
      title: product.product_title || "Unknown Product",
      price: `${salePrice} USD`,
      originalPrice: `${originalPrice} USD`,
      discount: discount || "0%",
      storeName: product.shop_name || "Unknown Store",
      evaluateRate: evaluateRate.toString(),
      shopUrl: shopUrl,
      categoryName: product.first_level_category_name || "N/A",
      commissionRate: product.commission_rate || "N/A",
      orders: product.lastest_volume || "N/A",
      imageUrl: imageUrl,
      shipping_fees: shipping_fees.toString(),
    };
  } catch (error) {
    console.error("Error fetching product from API:", error);
    throw error;
  }
}

async function generateAffiliateLink(
  url: string,
  appKey: string,
  appSecret: string,
  trackingId: string
): Promise<string | null> {
  try {
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
    const params: Record<string, string> = {
      method: "aliexpress.affiliate.link.generate",
      app_key: appKey,
      sign_method: "sha256",
      timestamp,
      v: "2.0",
      format: "json",
      tracking_id: trackingId,
      promotion_link_type: "0",
      source_values: url,
    };

    params.sign = generateApiSignature(params, appSecret);

    const response = await fetch(ALIEXPRESS_API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const queryString = new URLSearchParams(params).toString();
    const apiResponse = await fetch(`${ALIEXPRESS_API_URL}?${queryString}`);
    const data = await apiResponse.json();

    const result =
      data.aliexpress_affiliate_link_generate_response?.resp_result?.result;
    const promotionLinks = result?.promotion_links?.promotion_link;

    if (promotionLinks && promotionLinks.length > 0) {
      return promotionLinks[0].promotion_link;
    }

    return null;
  } catch (error) {
    console.error("Error generating affiliate link:", error);
    return null;
  }
}

async function generateAllOffers(
  productId: string,
  appKey: string,
  appSecret: string,
  trackingId: string
): Promise<OfferItem[]> {
  const offersPrimary = [
    {
      name: "Coin Page Offer",
      url: `https://m.aliexpress.com/p/coin-index/index.html?_immersiveMode=true&productIds=${productId}`,
    },
    {
      name: "Direct Product Link",
      url: `https://www.aliexpress.com/item/${productId}.html?sourceType=620`,
    },
    {
      name: "Super Deals",
      url: `https://www.aliexpress.com/item/${productId}.html?sourceType=562`,
    },
    {
      name: "Big Save Discount",
      url: `https://www.aliexpress.com/item/${productId}.html?sourceType=680`,
    },
    {
      name: "Limited Discount",
      url: `https://www.aliexpress.com/item/${productId}.html?sourceType=561`,
    },
    {
      name: "Potential Discount",
      url: `https://www.aliexpress.com/item/${productId}.html?sourceType=504`,
    },
    {
      name: "Bundle Direct",
      url: `https://www.aliexpress.com/item/${productId}.html?sourceType=570`,
    },
    {
      name: "Bundle Deals Page",
      url: `https://www.aliexpress.com/ssr/300000512/BundleDeals2?&pha_manifest=ssr&productIds=${productId}`,
    },
  ];

  const offersSecondary = [
    {
        name: "Coin Page Offer",
        url: `https://star.aliexpress.com/share/share.htm?redirectUrl=https://m.aliexpress.com/p/coin-index/index.html?_immersiveMode=true&productIds=${productId}`
    },
    {
        name: "Direct Product Link",
        url: `https://star.aliexpress.com/share/share.htm?redirectUrl=https://www.aliexpress.com/item/${productId}.html?sourceType=620`
    },
    {
        name: "Super Deals",
        url: `https://star.aliexpress.com/share/share.htm?redirectUrl=https://www.aliexpress.com/item/${productId}.html?sourceType=562`
    },
    {
        name: "Big Save Discount",
        url: `https://star.aliexpress.com/share/share.htm?redirectUrl=https://www.aliexpress.com/item/${productId}.html?sourceType=680`
    },
    {
        name: "Limited Discount",
        url: `https://star.aliexpress.com/share/share.htm?redirectUrl=https://www.aliexpress.com/item/${productId}.html?sourceType=561`
    },
    {
        name: "Potential Discount",
        url: `https://star.aliexpress.com/share/share.htm?redirectUrl=https://www.aliexpress.com/item/${productId}.html?sourceType=504`
    },
    {
        name: "Bundle Direct",
        url: `https://star.aliexpress.com/share/share.htm?redirectUrl=https://www.aliexpress.com/item/${productId}.html?sourceType=570`
    },
    {
        name: "Bundle Deals Page",
        url: `https://star.aliexpress.com/share/share.htm?redirectUrl=https://www.aliexpress.com/ssr/300000512/BundleDeals2?&pha_manifest=ssr&productIds=${productId}`
    },
  ];

  const results: OfferItem[] = [];

  for (let i = 0; i < offersPrimary.length; i++) {
    const primaryOffer = offersPrimary[i];
    const secondaryOffer = offersSecondary[i];

    let affiliateLink = await generateAffiliateLink(
      primaryOffer.url,
      appKey,
      appSecret,
      trackingId
    );

    if (!affiliateLink) {
      console.log(`Primary link failed for ${primaryOffer.name}, trying secondary...`);
      affiliateLink = await generateAffiliateLink(
        secondaryOffer.url,
        appKey,
        appSecret,
        trackingId
      );
    }

    results.push({
      name: primaryOffer.name,
      link: affiliateLink || primaryOffer.url,
      success: !!affiliateLink,
    });
  }

  return results;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/product", async (req: Request, res: Response) => {
    try {
      const { url, appKey, appSecret, trackingId }: ProductRequest = req.body;

      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      if (!appKey || !appSecret || !trackingId) {
        return res.status(400).json({ message: "API credentials are required" });
      }

      if (
        !url.includes("aliexpress.com") &&
        !url.includes("alix.live") &&
        !url.includes("s.click.aliexpress.com")
      ) {
        return res.status(400).json({ message: "Please provide a valid AliExpress URL" });
      }

      const finalUrl = await resolveRedirects(url);
      const productId = extractProductId(finalUrl) || extractProductId(url);

      if (!productId) {
        return res.status(400).json({ message: "Could not extract product ID from URL" });
      }

      let productData = {
        title: "",
        price: "N/A",
        originalPrice: "N/A",
        discount: "0%",
        storeName: "Unknown Store",
        evaluateRate: "N/A",
        shopUrl: "N/A",
        categoryName: "N/A",
        commissionRate: "N/A",
        orders: "N/A",
        imageUrl: null as string | null,
        shipping_fees: "Free Shipping",
      };

      try {
        const apiData = await getProductDetailsFromApi(
          productId,
          appKey,
          appSecret,
          trackingId
        );
        productData = { ...productData, ...apiData };
      } catch (apiError) {
        console.log("API failed, falling back to scraping");
      }

      const scrapedData = await getProductDetails(productId);
      if (!productData.title || productData.title === "Unknown Product" || productData.title === "Unable to extract title") {
        productData.title = scrapedData.title;
      }
      if (!productData.imageUrl) {
        productData.imageUrl = scrapedData.imageUrl;
      }

      const offers = await generateAllOffers(
        productId,
        appKey,
        appSecret,
        trackingId
      );

      const response: ProductResponse = {
        id: `${productId}-${Date.now()}`,
        productId,
        title: productData.title,
        imageUrl: productData.imageUrl,
        price: productData.price,
        originalPrice: productData.originalPrice,
        discount: productData.discount,
        storeName: productData.storeName,
        evaluateRate: productData.evaluateRate,
        shopUrl: productData.shopUrl,
        categoryName: productData.categoryName,
        commissionRate: productData.commissionRate,
        orders: productData.orders,
          shipping_fees: productData.shipping_fees,
        searchedAt: new Date().toISOString(),
        offers,
      };

      return res.json(response);
    } catch (error) {
      console.error("Error processing product:", error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to process product",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
