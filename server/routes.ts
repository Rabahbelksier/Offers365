import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import * as cheerio from "cheerio";
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
  searchedAt: string;
  offers: OfferItem[];
}

const ALIEXPRESS_API_URL = "https://api-sg.aliexpress.com/sync";

function extractProductId(text: string): string | null {
  const patterns = [
    /[?&]productIds=(\d+)/,
    /[?&]productId=(\d+)/,
    /\/item\/(\d+)\.(?:html|htm)/,
    /\/item\/(\d+)(?:\?|$)/,
    /\/product\/(\d+)/,
    /\/i\/(\d+)/,
    /\/p\/[^/]+\/index\.html[?&]productIds=(\d+)/,
    /\/ssr\/.*?[?&]productIds=(\d+)/,
    /\/[a-z0-9]+\.html\?.*?productId(?:s)?=(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

async function resolveRedirects(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
    });
    return response.url;
  } catch {
    return url;
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
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const html = await response.text();

    let title: string | null = null;
    let imageUrl: string | null = null;

    const subjectMatch = html.match(/"subject":"([^"]+)"/);
    if (subjectMatch) {
      title = subjectMatch[1];
    }

    if (!title) {
      const $ = cheerio.load(html);
      title = $("title").text() || null;
    }

    const imageMatch = html.match(/"imagePath":"([^"]+)"/);
    if (imageMatch) {
      imageUrl = imageMatch[1];
      if (!imageUrl.startsWith("http")) {
        imageUrl = `https:${imageUrl}`;
      }
    }

    if (!imageUrl) {
      const ogImageMatch = html.match(/og:image" content="([^"]+)"/);
      if (ogImageMatch) {
        imageUrl = ogImageMatch[1];
      }
    }

    return {
      title: title ? title.slice(0, 255).trim() : "Unable to extract title",
      imageUrl,
    };
  } catch (error) {
    console.error("Error extracting product details:", error);
    return { title: "Unable to extract title", imageUrl: null };
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
  imageUrl: string | null;
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
          discount = `${(((original - sale) / original) * 100).toFixed(0)}%`;
        }
      } catch {
        discount = "";
      }
    }

    return {
      title: product.product_title || "Unknown Product",
      price: `$${salePrice} USD`,
      originalPrice: `$${originalPrice} USD`,
      discount: discount || "0%",
      storeName: product.shop_name || "Unknown Store",
      imageUrl: null,
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

  const offersSecondary = offersPrimary.map(
    (offer) =>
      `https://star.aliexpress.com/share/share.htm?redirectUrl=${encodeURIComponent(offer.url)}`
  );

  const results: OfferItem[] = [];

  for (let i = 0; i < offersPrimary.length; i++) {
    const { name, url } = offersPrimary[i];

    let affiliateLink = await generateAffiliateLink(
      url,
      appKey,
      appSecret,
      trackingId
    );

    if (!affiliateLink) {
      affiliateLink = await generateAffiliateLink(
        offersSecondary[i],
        appKey,
        appSecret,
        trackingId
      );
    }

    results.push({
      name,
      link: affiliateLink || url,
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
        imageUrl: null as string | null,
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
      if (!productData.title || productData.title === "Unknown Product") {
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
