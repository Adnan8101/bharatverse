import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') || 'stats'

        switch (type) {
            case 'stats':
                return await getProjectStats()
            case 'team':
                return await getTeamInfo()
            case 'tech-stack':
                return await getTechStack()
            case 'recent-changes':
                return await getRecentChanges()
            default:
                return NextResponse.json({ success: false, error: 'Invalid type parameter' }, { status: 400 })
        }
    } catch (error) {
        console.error('Documentation API error:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch documentation data' }, { status: 500 })
    }
}

async function getProjectStats() {
    try {
        // Get database statistics
        const [users, products, stores, orders] = await Promise.all([
            prisma.user.count(),
            prisma.product.count(),
            prisma.store.count(),
            prisma.order.count()
        ])

        // Get file system statistics
        const projectRoot = path.resolve(process.cwd())
        const stats = await getFileStats(projectRoot)

        return NextResponse.json({
            success: true,
            data: {
                stats: {
                    users,
                    products,
                    stores,
                    orders,
                    files: stats.totalFiles,
                    apiRoutes: stats.apiRoutes,
                    components: stats.components,
                    dependencies: stats.dependencies
                }
            }
        })
    } catch (error) {
        console.error('Error getting project stats:', error)
        return NextResponse.json({
            success: true,
            data: {
                stats: {
                    users: 0,
                    products: 0,
                    stores: 0,
                    orders: 0,
                    files: 150,
                    apiRoutes: 25,
                    components: 50,
                    dependencies: { total: 20 }
                }
            }
        })
    }
}

async function getTeamInfo() {
    return NextResponse.json({
        success: true,
        data: {
            team: [
                {
                    name: 'Adnan Qureshi',
                    role: 'Full-Stack Developer & Project Lead',
                    email: 'adnanqureshi8101@gmail.com',
                    skills: ['Next.js', 'PostgreSQL', 'Prisma', 'Node.js', 'React', 'TailwindCSS'],
                    contributions: [
                        'Backend API Development',
                        'Database Design & Implementation',
                        'Authentication Systems',
                        'Admin Dashboard & Analytics',
                        'DevOps & Deployment'
                    ]
                },
                {
                    name: 'Harsh',
                    role: 'Frontend Developer & UI/UX Designer',
                    skills: ['React', 'TailwindCSS', 'Redux', 'JavaScript', 'UI/UX Design'],
                    contributions: [
                        'Frontend Development',
                        'UI/UX Design & Implementation',
                        'Component Architecture',
                        'State Management',
                        'Responsive Design & Styling'
                    ]
                }
            ],
            institution: 'Thakur College of Engineering and Technology',
            department: 'Artificial Intelligence & Machine Learning (AIML)',
            duration: '3 Months',
            methodology: {
                versionControl: 'Git-based collaboration with feature branches',
                development: 'Sprint-based development with regular reviews',
                codeReview: 'Peer review process for code quality'
            }
        }
    })
}

async function getTechStack() {
    return NextResponse.json({
        success: true,
        data: {
            techStack: {
                frontend: [
                    { name: 'Next.js', version: '15.3.5', category: 'Framework' },
                    { name: 'React', version: '19.0.0', category: 'Library' },
                    { name: 'TailwindCSS', version: '4.0', category: 'Styling' },
                    { name: 'Redux Toolkit', version: '2.8.2', category: 'State Management' },
                    { name: 'Lucide React', version: '0.525.0', category: 'Icons' }
                ],
                backend: [
                    { name: 'Node.js', version: 'Latest', category: 'Runtime' },
                    { name: 'PostgreSQL', version: 'Latest', category: 'Database' },
                    { name: 'Prisma', version: '6.16.2', category: 'ORM' },
                    { name: 'JWT', version: '9.0.2', category: 'Authentication' }
                ],
                integrations: [
                    { name: 'Clerk', version: '6.32.0', category: 'Authentication' },
                    { name: 'Razorpay', version: '2.9.6', category: 'Payment Gateway' },
                    { name: 'Google AI (Gemini)', version: '0.24.1', category: 'AI Integration' },
                    { name: 'Nodemailer', version: '7.0.6', category: 'Email Service' },
                    { name: 'Socket.io', version: '4.8.1', category: 'Real-time Communication' }
                ],
                deployment: [
                    { name: 'Vercel', category: 'Hosting Platform' },
                    { name: 'GitHub', category: 'Version Control' },
                    { name: 'Neon/PlanetScale', category: 'Database Hosting' }
                ]
            }
        }
    })
}

async function getRecentChanges() {
    return NextResponse.json({
        success: true,
        data: {
            changes: [
                {
                    id: 1,
                    date: '2025-01-25',
                    type: 'rebranding',
                    title: 'Complete Rebranding to BharatVerse',
                    description: 'Updated all references from GoCart to BharatVerse across the entire application',
                    author: 'Adnan Qureshi',
                    impact: 'high'
                },
                {
                    id: 2,
                    date: '2025-01-25',
                    type: 'deployment',
                    title: 'Vercel Deployment Configuration',
                    description: 'Added comprehensive Vercel deployment configuration and documentation',
                    author: 'Adnan Qureshi',
                    impact: 'high'
                },
                {
                    id: 3,
                    date: '2025-01-25',
                    type: 'documentation',
                    title: 'Enhanced Documentation System',
                    description: 'Updated documentation with latest project data and comprehensive guides',
                    author: 'Adnan Qureshi',
                    impact: 'medium'
                },
                {
                    id: 4,
                    date: '2025-01-24',
                    type: 'feature',
                    title: 'AI-Powered Price Optimization',
                    description: 'Implemented intelligent pricing recommendations using Google Gemini AI',
                    author: 'Adnan Qureshi',
                    impact: 'high'
                },
                {
                    id: 5,
                    date: '2025-01-23',
                    type: 'enhancement',
                    title: 'Enhanced Store Chat System',
                    description: 'Improved real-time messaging between customers and store owners',
                    author: 'Harsh',
                    impact: 'medium'
                }
            ]
        }
    })
}

async function getFileStats(projectRoot) {
    try {
        const packageJsonPath = path.join(projectRoot, 'package.json')
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
        
        // Count files
        const appDir = path.join(projectRoot, 'app')
        const componentsDir = path.join(projectRoot, 'components')
        
        let totalFiles = 0
        let apiRoutes = 0
        let components = 0

        // Count API routes
        const apiDir = path.join(appDir, 'api')
        if (fs.existsSync(apiDir)) {
            apiRoutes = countFilesRecursive(apiDir, '.js')
        }

        // Count components
        if (fs.existsSync(componentsDir)) {
            components = countFilesRecursive(componentsDir, '.jsx')
        }

        // Count total files
        totalFiles = countFilesRecursive(projectRoot, ['.js', '.jsx', '.ts', '.tsx'])

        return {
            totalFiles,
            apiRoutes,
            components,
            dependencies: {
                total: Object.keys(packageJson.dependencies || {}).length + Object.keys(packageJson.devDependencies || {}).length
            }
        }
    } catch (error) {
        console.error('Error getting file stats:', error)
        return {
            totalFiles: 150,
            apiRoutes: 25,
            components: 50,
            dependencies: { total: 20 }
        }
    }
}

function countFilesRecursive(dir, extensions) {
    if (!fs.existsSync(dir)) return 0
    
    let count = 0
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
        const itemPath = path.join(dir, item)
        const stat = fs.statSync(itemPath)
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            count += countFilesRecursive(itemPath, extensions)
        } else if (stat.isFile()) {
            const ext = path.extname(item)
            if (Array.isArray(extensions) ? extensions.includes(ext) : ext === extensions) {
                count++
            }
        }
    }
    
    return count
}
