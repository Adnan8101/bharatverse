import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyC1ZvdmAx8K5Yg13RpiDiWMFyn6sJoO7LA');

// Function to analyze product image and generate details
export async function analyzeProductImage(imageData, imageType = 'image/jpeg') {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    Analyze this product image and provide:
    1. A compelling product title (max 60 characters)
    2. A detailed product description (100-200 words)
    3. Suggest an Indian market price in INR (be realistic based on the product type)
    4. Suggest appropriate product category from: Electronics, Clothing, Home & Garden, Sports, Books, Toys, Beauty, Food & Beverages, Automotive, Health

    Please format your response as JSON:
    {
      "title": "Product title here",
      "description": "Detailed description here",
      "suggestedPrice": 1500,
      "category": "Category name",
      "confidence": 0.85
    }

    Make sure the price is reasonable for the Indian market and the description highlights key features and benefits.
    `;

    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: imageType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from the response
    try {
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const productData = JSON.parse(cleanedText);
      
      // Validate required fields
      if (!productData.title || !productData.description || !productData.suggestedPrice) {
        throw new Error('Invalid response format');
      }

      return {
        success: true,
        data: {
          title: productData.title.substring(0, 60), // Ensure max length
          description: productData.description,
          suggestedPrice: Math.round(productData.suggestedPrice),
          category: productData.category || 'Electronics',
          confidence: productData.confidence || 0.8
        }
      };
    } catch (parseError) {
      // Fallback: Extract information using regex
      const titleMatch = text.match(/"title":\s*"([^"]+)"/);
      const descMatch = text.match(/"description":\s*"([^"]+)"/);
      const priceMatch = text.match(/"suggestedPrice":\s*(\d+)/);
      const categoryMatch = text.match(/"category":\s*"([^"]+)"/);

      return {
        success: true,
        data: {
          title: titleMatch ? titleMatch[1].substring(0, 60) : 'AI Generated Product',
          description: descMatch ? descMatch[1] : 'AI generated product description based on image analysis.',
          suggestedPrice: priceMatch ? parseInt(priceMatch[1]) : 999,
          category: categoryMatch ? categoryMatch[1] : 'Electronics',
          confidence: 0.7
        }
      };
    }
  } catch (error) {
    console.error('Error analyzing product image:', error);
    return {
      success: false,
      error: 'Failed to analyze image. Please try again.',
      data: {
        title: 'Product Title',
        description: 'Please add a product description.',
        suggestedPrice: 999,
        category: 'Electronics',
        confidence: 0
      }
    };
  }
}

// Function to improve existing product descriptions
export async function improveProductDescription(currentTitle, currentDescription, category) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    Improve this product listing for the Indian e-commerce market:
    
    Current Title: ${currentTitle}
    Current Description: ${currentDescription}
    Category: ${category}
    
    Please provide:
    1. An improved, SEO-friendly title (max 60 characters)
    2. An enhanced description (100-200 words) that highlights benefits and features
    3. Suggest keywords for better discoverability
    
    Format as JSON:
    {
      "improvedTitle": "Better title here",
      "improvedDescription": "Enhanced description here",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const improvements = JSON.parse(cleanedText);
      
      return {
        success: true,
        data: improvements
      };
    } catch (parseError) {
      return {
        success: false,
        error: 'Failed to improve description'
      };
    }
  } catch (error) {
    console.error('Error improving product description:', error);
    return {
      success: false,
      error: 'Failed to improve description'
    };
  }
}

// Function to generate product variations or related suggestions
export async function generateProductSuggestions(productTitle, category) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    Based on this product: "${productTitle}" in category "${category}", 
    suggest 5 related products that a store owner might want to add to their inventory.
    Consider the Indian market and popular product combinations.
    
    Format as JSON:
    {
      "suggestions": [
        {
          "title": "Related product title",
          "category": "Category",
          "estimatedPrice": 500
        }
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const suggestions = JSON.parse(cleanedText);
      
      return {
        success: true,
        data: suggestions
      };
    } catch (parseError) {
      return {
        success: false,
        error: 'Failed to generate suggestions'
      };
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return {
      success: false,
      error: 'Failed to generate suggestions'
    };
  }
}
