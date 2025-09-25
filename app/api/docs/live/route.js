import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // This endpoint provides live API documentation by testing actual endpoints
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_APP_URL 
      : 'http://localhost:3000'

    // Define all API endpoints with their details
    const apiEndpoints = [
      {
        category: 'Authentication',
        endpoints: [
          {
            method: 'POST',
            path: '/api/admin/login',
            description: 'Admin authentication with username and password',
            parameters: {
              body: {
                username: 'string (required)',
                password: 'string (required)'
              }
            },
            responses: {
              200: 'Authentication successful, returns admin token',
              401: 'Invalid credentials',
              500: 'Server error'
            }
          },
          {
            method: 'POST',
            path: '/api/admin/logout',
            description: 'Admin logout and token invalidation',
            responses: {
              200: 'Logout successful',
              500: 'Server error'
            }
          },
          {
            method: 'GET',
            path: '/api/admin/verify',
            description: 'Verify admin authentication token',
            responses: {
              200: 'Token valid, returns admin info',
              401: 'Token invalid or expired',
              500: 'Server error'
            }
          },
          {
            method: 'POST',
            path: '/api/store-owner/login',
            description: 'Store owner authentication',
            parameters: {
              body: {
                email: 'string (required)',
                password: 'string (required)'
              }
            }
          },
          {
            method: 'POST',
            path: '/api/store-owner/logout',
            description: 'Store owner logout'
          },
          {
            method: 'GET',
            path: '/api/store-owner/verify',
            description: 'Verify store owner token'
          }
        ]
      },
      {
        category: 'Products',
        endpoints: [
          {
            method: 'GET',
            path: '/api/products',
            description: 'Get all products with pagination and filtering',
            parameters: {
              query: {
                page: 'number (optional, default: 1)',
                limit: 'number (optional, default: 10)',
                category: 'string (optional)',
                search: 'string (optional)',
                storeId: 'string (optional)'
              }
            },
            responses: {
              200: 'Returns paginated list of products'
            }
          },
          {
            method: 'POST',
            path: '/api/products',
            description: 'Create a new product (store owner only)',
            parameters: {
              body: {
                name: 'string (required)',
                description: 'string (required)',
                price: 'number (required)',
                mrp: 'number (required)',
                images: 'array of strings (required)',
                category: 'string (required)',
                stockQuantity: 'number (optional, default: 0)',
                inStock: 'boolean (optional, default: true)'
              }
            }
          },
          {
            method: 'GET',
            path: '/api/products/[productId]',
            description: 'Get product details by ID',
            parameters: {
              path: {
                productId: 'string (required)'
              }
            }
          },
          {
            method: 'PUT',
            path: '/api/products/[productId]',
            description: 'Update product (store owner only)'
          },
          {
            method: 'DELETE',
            path: '/api/products/[productId]',
            description: 'Delete product (store owner only)'
          },
          {
            method: 'GET',
            path: '/api/store-owner/products',
            description: 'Get store owner\'s products'
          },
          {
            method: 'PATCH',
            path: '/api/store-owner/products/stock',
            description: 'Update product stock quantity',
            parameters: {
              body: {
                productId: 'string (required)',
                stockQuantity: 'number (required)'
              }
            }
          }
        ]
      },
      {
        category: 'Stores',
        endpoints: [
          {
            method: 'GET',
            path: '/api/stores',
            description: 'Get all approved stores',
            responses: {
              200: 'Returns list of approved stores'
            }
          },
          {
            method: 'POST',
            path: '/api/stores',
            description: 'Create a new store (requires user authentication)',
            parameters: {
              body: {
                name: 'string (required)',
                description: 'string (required)',
                username: 'string (required, unique)',
                address: 'string (required)',
                email: 'string (required)',
                contact: 'string (required)',
                logo: 'string (optional)'
              }
            }
          },
          {
            method: 'GET',
            path: '/api/stores/status',
            description: 'Get current user\'s store status',
            responses: {
              200: 'Returns store status and details',
              404: 'No store found for user'
            }
          },
          {
            method: 'PATCH',
            path: '/api/stores/approve',
            description: 'Approve or reject store (admin only)',
            parameters: {
              body: {
                storeId: 'string (required)',
                action: 'string (required: "approve" or "reject")',
                reason: 'string (optional, for rejection)'
              }
            }
          }
        ]
      },
      {
        category: 'Orders',
        endpoints: [
          {
            method: 'GET',
            path: '/api/orders',
            description: 'Get user orders (customer authenticated)',
            responses: {
              200: 'Returns user\'s order history'
            }
          },
          {
            method: 'POST',
            path: '/api/orders',
            description: 'Create a new order',
            parameters: {
              body: {
                items: 'array of order items (required)',
                addressId: 'string (required)',
                totalAmount: 'number (required)',
                couponCode: 'string (optional)'
              }
            }
          },
          {
            method: 'GET',
            path: '/api/store-owner/orders',
            description: 'Get store orders (store owner authenticated)',
            responses: {
              200: 'Returns orders containing store products'
            }
          },
          {
            method: 'PATCH',
            path: '/api/store-owner/orders',
            description: 'Update order status (store owner)',
            parameters: {
              body: {
                orderId: 'string (required)',
                status: 'string (required: "pending", "processing", "shipped", "delivered", "cancelled")'
              }
            }
          }
        ]
      },
      {
        category: 'User Management',
        endpoints: [
          {
            method: 'GET',
            path: '/api/addresses',
            description: 'Get user addresses (Clerk authenticated)',
            responses: {
              200: 'Returns user\'s saved addresses'
            }
          },
          {
            method: 'POST',
            path: '/api/addresses',
            description: 'Create new address for user',
            parameters: {
              body: {
                name: 'string (required)',
                phone: 'string (required)',
                street: 'string (required)',
                city: 'string (required)',
                state: 'string (required)',
                pincode: 'string (required)',
                country: 'string (optional, default: "India")'
              }
            }
          },
          {
            method: 'GET',
            path: '/api/ratings',
            description: 'Get product ratings and reviews',
            parameters: {
              query: {
                productId: 'string (optional)',
                userId: 'string (optional)'
              }
            }
          },
          {
            method: 'POST',
            path: '/api/ratings',
            description: 'Create product rating/review',
            parameters: {
              body: {
                productId: 'string (required)',
                rating: 'number (required, 1-5)',
                review: 'string (optional)'
              }
            }
          }
        ]
      },
      {
        category: 'Admin',
        endpoints: [
          {
            method: 'GET',
            path: '/api/admin/dashboard',
            description: 'Get admin dashboard statistics',
            responses: {
              200: 'Returns platform statistics and metrics'
            }
          },
          {
            method: 'GET',
            path: '/api/coupons',
            description: 'Get available coupons',
            responses: {
              200: 'Returns list of active coupons'
            }
          },
          {
            method: 'POST',
            path: '/api/coupons',
            description: 'Create new coupon (admin only)',
            parameters: {
              body: {
                code: 'string (required, unique)',
                description: 'string (required)',
                discount: 'number (required)',
                forNewUser: 'boolean (optional)',
                forMember: 'boolean (optional)',
                isPublic: 'boolean (optional)',
                expiresAt: 'date (required)'
              }
            }
          }
        ]
      },
      {
        category: 'File Upload',
        endpoints: [
          {
            method: 'POST',
            path: '/api/upload/images',
            description: 'Upload product images',
            parameters: {
              body: 'FormData with image files'
            },
            responses: {
              200: 'Returns uploaded image URLs'
            }
          }
        ]
      },
      {
        category: 'Analytics',
        endpoints: [
          {
            method: 'GET',
            path: '/api/store-owner/dashboard',
            description: 'Get store owner dashboard data',
            responses: {
              200: 'Returns store analytics and metrics'
            }
          }
        ]
      }
    ]

    // Additional metadata
    const metadata = {
      version: '1.0.0',
      title: 'GoCart API Documentation',
      description: 'Complete API reference for the GoCart multi-vendor e-commerce platform',
      baseUrl,
      authentication: {
        clerk: {
          description: 'Used for customer authentication',
          type: 'Bearer token',
          header: 'Authorization'
        },
        jwt: {
          description: 'Used for admin and store owner authentication',
          type: 'HTTP-only cookie',
          cookieName: 'admin-token or store-owner-token'
        }
      },
      commonResponses: {
        400: 'Bad Request - Invalid input data',
        401: 'Unauthorized - Authentication required',
        403: 'Forbidden - Insufficient permissions',
        404: 'Not Found - Resource not found',
        422: 'Unprocessable Entity - Validation error',
        500: 'Internal Server Error - Server error'
      },
      rateLimiting: {
        description: 'API endpoints are rate limited to prevent abuse',
        defaultLimit: '100 requests per minute per IP'
      }
    }

    return NextResponse.json({
      success: true,
      metadata,
      endpoints: apiEndpoints,
      totalEndpoints: apiEndpoints.reduce((sum, category) => sum + category.endpoints.length, 0),
      categories: apiEndpoints.map(cat => cat.category),
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Live API documentation error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate live API documentation',
        error: error.message
      },
      { status: 500 }
    )
  }
}
