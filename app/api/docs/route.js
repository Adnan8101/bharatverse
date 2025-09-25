import { NextResponse } from 'next/server'
import { APIDocGenerator, SchemaDocGenerator, ProjectStatsGenerator } from '@/lib/documentation-generator'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    const response = {}

    if (type === 'all' || type === 'api') {
      const apiGenerator = new APIDocGenerator()
      const apiRoutes = await apiGenerator.scanAPIRoutes()
      
      // Group routes by category
      const groupedRoutes = apiRoutes.reduce((acc, route) => {
        if (!acc[route.category]) {
          acc[route.category] = []
        }
        acc[route.category].push(route)
        return acc
      }, {})

      response.api = {
        routes: apiRoutes,
        grouped: groupedRoutes,
        openapi: apiGenerator.generateOpenAPISpec()
      }
    }

    if (type === 'all' || type === 'schema') {
      const schemaGenerator = new SchemaDocGenerator()
      const schema = await schemaGenerator.extractPrismaSchema()
      response.schema = schema
    }

    if (type === 'all' || type === 'stats') {
      const statsGenerator = new ProjectStatsGenerator()
      const stats = await statsGenerator.generateStats()
      response.stats = stats
    }

    // Add basic project info
    if (type === 'all' || type === 'info') {
      response.info = {
        name: 'GoCart',
        version: '1.0.0',
        description: 'Multi-vendor e-commerce platform',
        tech: ['Next.js', 'PostgreSQL', 'Prisma', 'TailwindCSS', 'Clerk'],
        features: [
          'Multi-vendor support',
          'Admin dashboard',
          'Store management',
          'Order processing',
          'User authentication',
          'Product catalog',
          'Analytics and reporting'
        ],
        team: [
          {
            name: 'Adnan',
            role: 'Full-Stack Developer & Project Lead',
            expertise: ['Backend Development', 'Database Design', 'DevOps']
          },
          {
            name: 'Harsh',
            role: 'Frontend Developer & UI/UX Designer',
            expertise: ['React Development', 'UI/UX Design', 'State Management']
          }
        ],
        institution: 'Thakur College of Engineering and Technology',
        department: 'Artificial Intelligence & Machine Learning (AIML)',
        duration: '3 months'
      }
    }

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Documentation API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate documentation',
        error: error.message
      },
      { status: 500 }
    )
  }
}
