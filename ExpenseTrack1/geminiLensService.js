/**
 * STS FINTECH PRIVATE LIMITED
 * Gemini Lens & Google Lens Document Vision AI Engine
 * 
 * Powered by Google Gemini Multimodal Vision API
 */

'use strict';

const https = require('https');

class GeminiLensService {
  constructor(defaultApiKey = '') {
    this.defaultApiKey = defaultApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    this.primaryModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  /**
   * Scans a bill image using Google Gemini Multimodal Vision
   * @param {string} imageDataUrl Base64 data URL or raw base64 string
   * @param {string} userApiKey Optional user-provided Gemini API key
   * @returns {Promise<object>}
   */
  async scanBillWithGemini(imageDataUrl, userApiKey = '') {
    const key = (userApiKey || this.defaultApiKey || '').trim();
    if (!key) {
      return {
        success: false,
        error: 'NO_API_KEY',
        message: 'Google Gemini API key not configured. Please provide an API key or use local OCR.',
      };
    }

    // Extract mime type and raw base64
    let mimeType = 'image/jpeg';
    let base64Data = imageDataUrl;

    if (imageDataUrl.startsWith('data:')) {
      const match = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    const promptText = `
You are the STS FINTECH Universal Document Vision Engine (Google Lens & Gemini Multimodal Intelligence).
Analyze this bill, receipt, or invoice image carefully. Read all printed and handwritten text, logos, stamps, headers, tables, tax sections, and totals.

CRITICAL INSTRUCTIONS:
1. MERCHANT NAME: Identify the actual seller, shop, restaurant, pharmacy, hospital, transport operator, or issuer from the header/logo. DO NOT extract customer name, doctor name, or product name as merchant.
2. GSTIN: Extract the 15-character Indian Goods and Services Tax Identification Number (e.g., 33AAHFR2641F1ZI) printed near GST/GSTIN/SAC. Pay special attention to optical confusions (0/O, 1/I, 5/S, 8/B). If no GSTIN is visible, return an empty string.
3. LOCATION & PINCODE: Extract the complete physical address, road, area, landmark, district, state, and 6-digit postal PIN code (e.g., 632007).
4. DATE: Identify the invoice or transaction date and format as YYYY-MM-DD. Handle 2-digit years (e.g. 01/11/26 -> 2026-11-01, 08/10/25 -> 2025-10-08).
5. FINANCIAL AMOUNTS:
   - grand_total: The final payable amount or amount paid (number).
   - subtotal: Pre-tax subtotal if printed (number).
   - total_tax: Sum of CGST + SGST + IGST (number).
   - cgst: Central GST amount (number).
   - sgst: State GST amount (number).
   - discount: Total discount amount (number).
6. PAYMENT MODE: One of "Cash", "Card / Cardless", "UPI", "Net Banking". Check for Credit Card, Debit Card, UPI, GPAY, Cash, etc.
7. PAYMENT STATUS: "paid" if there is a PAID stamp, "CASH RECEIVED", completed transaction, or paid receipt. Otherwise "needs_confirmation".
8. CATEGORY: One of "Dining & Restaurant", "Health & Medical", "Clothing & Apparel", "Shopping & Electronics", "Travel & Transit", "Fuel & Auto", "Hotel & Lodging", "General".
9. INVOICE REF: Bill number, invoice number, or UTS ticket number.
10. RAW TRANSCRIPTION: Transcribe the text visible on the bill.

Respond ONLY with valid JSON in this exact structure:
{
  "merchant_name": "string",
  "gstin": "string",
  "merchant_address": "string",
  "pincode": "string",
  "bill_date": "YYYY-MM-DD",
  "raw_date_str": "string",
  "time": "string",
  "grand_total": 0.00,
  "subtotal": 0.00,
  "total_tax": 0.00,
  "cgst": 0.00,
  "sgst": 0.00,
  "discount": 0.00,
  "payment_mode": "string",
  "payment_status": "paid | needs_confirmation | unpaid",
  "category": "string",
  "invoice_number": "string",
  "raw_ocr_text": "string",
  "confidence_score": 99,
  "explanation": "string"
}
`;

    const requestPayload = JSON.stringify({
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.1,
      },
    });

    const modelsToTry = [this.primaryModel, 'gemini-1.5-flash-latest', 'gemini-2.0-flash'];

    let lastError = null;
    for (const model of modelsToTry) {
      try {
        const result = await this.callGeminiApi(model, key, requestPayload);
        if (result && result.success) {
          return result;
        }
        if (result && result.error) {
          lastError = result.error;
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    return {
      success: false,
      error: 'GEMINI_CALL_FAILED',
      message: `Gemini Lens Vision API call failed: ${lastError || 'Unknown error'}`,
    };
  }

  callGeminiApi(model, apiKey, requestPayload) {
    return new Promise((resolve) => {
      const url = `/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const options = {
        hostname: 'generativelanguage.googleapis.com',
        port: 443,
        path: url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestPayload),
        },
        timeout: 15000,
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsedRes = JSON.parse(body);
              const textOutput = parsedRes.candidates?.[0]?.content?.parts?.[0]?.text;
              if (textOutput) {
                const cleanJson = textOutput.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
                const extractedData = JSON.parse(cleanJson);
                resolve({
                  success: true,
                  modelUsed: model,
                  data: extractedData,
                  rawResponse: parsedRes,
                });
                return;
              }
            } catch (jsonErr) {
              resolve({ success: false, error: 'JSON_PARSE_ERROR', message: jsonErr.message });
              return;
            }
          }
          resolve({
            success: false,
            error: `HTTP_${res.statusCode}`,
            message: `Gemini returned HTTP ${res.statusCode}: ${body.slice(0, 300)}`,
          });
        });
      });

      req.on('error', (e) => resolve({ success: false, error: 'NETWORK_ERROR', message: e.message }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false, error: 'TIMEOUT', message: 'Gemini Lens API request timed out (15s).' });
      });

      req.write(requestPayload);
      req.end();
    });
  }
}

module.exports = new GeminiLensService();

