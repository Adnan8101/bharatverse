'use client'
import { useState, useEffect } from 'react'
import { 
  BookOpen, 
  Users, 
  User,
  Code, 
  Layers, 
  Server, 
  Database, 
  GitBranch, 
  Clock, 
  Globe, 
  Rocket,
  FileText,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  Package,
  Zap,
  Shield,
  Activity
} from 'lucide-react'
import { DataService } from '@/lib/data-service'

// Documentation sections structure
const docSections = [
  {
    id: 'introduction',
    title: 'Introduction',
    icon: BookOpen,
    content: 'introduction'
  },
  {
    id: 'team',
    title: 'Team',
    icon: Users,
    content: 'team'
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    icon: Code,
    content: 'api'
  },
  {
    id: 'system-design',
    title: 'System Design',
    icon: Layers,
    content: 'system'
  },
  {
    id: 'tech-stack',
    title: 'Tech Stack',
    icon: Server,
    content: 'tech'
  },
  {
    id: 'project-history',
    title: 'Project History',
    icon: Clock,
    content: 'history'
  },
  {
    id: 'data-flow',
    title: 'Data Flow',
    icon: Activity,
    content: 'dataflow'
  },
  {
    id: 'schema-design',
    title: 'Schema Design',
    icon: Database,
    content: 'schema'
  },
  {
    id: 'deployment',
    title: 'Deployment',
    icon: Rocket,
    content: 'deployment'
  },
  {
    id: 'future-scope',
    title: 'Future Scope',
    icon: Zap,
    content: 'future'
  },
  {
    id: 'recent-changes',
    title: 'Recent Changes',
    icon: GitBranch,
    content: 'changes'
  }
]

const DocsPage = () => {
  const [selectedSection, setSelectedSection] = useState('introduction')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarMinimized, setSidebarMinimized] = useState(false)
  const [projectData, setProjectData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSections, setFilteredSections] = useState(docSections)

  // Filter sections based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSections(docSections)
    } else {
      const filtered = docSections.filter(section =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredSections(filtered)
    }
  }, [searchQuery])

  // Fetch project data on component mount
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Get some sample data to understand project structure
        const dataService = new DataService()
        const [products, stores] = await Promise.all([
          dataService.getProducts(),
          dataService.getStores()
        ])
        
        setProjectData({
          products: products?.products || [],
          stores: stores?.stores || [],
          totalProducts: products?.products?.length || 0,
          totalStores: stores?.stores?.length || 0
        })
      } catch (error) {
        console.error('Error fetching project data:', error)
        setProjectData({
          products: [],
          stores: [],
          totalProducts: 0,
          totalStores: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProjectData()
  }, [])

  const renderContent = () => {
    const section = docSections.find(s => s.id === selectedSection)
    if (!section) return null

    switch (section.content) {
      case 'introduction':
        return <IntroductionContent setSelectedSection={setSelectedSection} />
      case 'team':
        return <TeamContent />
      case 'api':
        return <APIContent />
      case 'system':
        return <SystemDesignContent />
      case 'tech':
        return <TechStackContent />
      case 'history':
        return <ProjectHistoryContent />
      case 'dataflow':
        return <DataFlowContent />
      case 'schema':
        return <SchemaDesignContent />
      case 'deployment':
        return <DeploymentContent />
      case 'future':
        return <FutureScopeContent />
      case 'changes':
        return <RecentChangesContent />
      default:
        return <IntroductionContent setSelectedSection={setSelectedSection} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white rounded-lg shadow-md"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Desktop minimize/restore button */}
      <div className="hidden lg:block fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarMinimized(!sidebarMinimized)}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        >
          {sidebarMinimized ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 bg-white shadow-xl transition-all duration-300 ${
        // Mobile behavior
        sidebarOpen ? 'translate-x-0 w-80' : '-translate-x-full w-80 lg:translate-x-0'
      } ${
        // Desktop behavior
        sidebarMinimized ? 'lg:w-0 lg:-translate-x-full' : 'lg:w-80 lg:translate-x-0'
      }`}>
        <div className="h-full overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              <span className="text-green-600">BharatVerse</span> Docs
            </h1>
            <p className="text-sm text-gray-600 mt-2">Complete Documentation</p>
            
            {/* Search functionality */}
            <div className="mt-4 relative">
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          
          <nav className="p-4 space-y-1 overflow-y-auto h-full pb-20">
            {searchQuery && filteredSections.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-4">
                No sections found for "{searchQuery}"
              </div>
            )}
            
            {filteredSections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setSelectedSection(section.id)
                    setSidebarOpen(false)
                    setSearchQuery('') // Clear search when selecting
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedSection === section.id
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{section.title}</span>
                  {selectedSection === section.id && <ChevronRight size={16} className="ml-auto" />}
                </button>
              )
            })}
            
            {/* Quick stats at bottom */}
            {!searchQuery && (
              <div className="mt-8 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2">Documentation Stats</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="font-semibold text-gray-700">{docSections.length}</div>
                    <div className="text-gray-500">Sections</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="font-semibold text-gray-700">Live</div>
                    <div className="text-gray-500">Data</div>
                  </div>
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className={`min-h-screen transition-all duration-300 ${
        sidebarMinimized ? 'lg:ml-0' : 'lg:ml-80'
      }`}>
        <div className="max-w-4xl mx-auto p-6 lg:p-12">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

// Introduction Content Component
const IntroductionContent = ({ setSelectedSection }) => {
  const [projectStats, setProjectStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjectStats = async () => {
      try {
        const response = await fetch('/api/docs?type=stats')
        const data = await response.json()
        if (data.success && data.data.stats) {
          setProjectStats(data.data.stats)
        }
      } catch (error) {
        console.error('Failed to fetch project stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjectStats()
  }, [])

  return (
    <div className="prose prose-gray max-w-none">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-green-600">BharatVerse</span> Documentation
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Comprehensive documentation for the multi-vendor e-commerce platform built with modern technologies
        </p>
      </div>

      {/* Project Stats */}
      <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 p-8 rounded-2xl mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Project Overview</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <Code className="text-blue-600 mx-auto mb-3" size={32} />
            <div className="text-3xl font-bold text-blue-600">
              {loading ? '...' : projectStats?.files || '150+'}
            </div>
            <div className="text-sm text-gray-600">Source Files</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <Server className="text-green-600 mx-auto mb-3" size={32} />
            <div className="text-3xl font-bold text-green-600">
              {loading ? '...' : projectStats?.apiRoutes || '25+'}
            </div>
            <div className="text-sm text-gray-600">API Endpoints</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <Package className="text-purple-600 mx-auto mb-3" size={32} />
            <div className="text-3xl font-bold text-purple-600">
              {loading ? '...' : projectStats?.components || '50+'}
            </div>
            <div className="text-sm text-gray-600">React Components</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <Database className="text-orange-600 mx-auto mb-3" size={32} />
            <div className="text-3xl font-bold text-orange-600">
              {loading ? '...' : projectStats?.dependencies?.total || '20+'}
            </div>
            <div className="text-sm text-gray-600">Dependencies</div>
          </div>
        </div>
      </div>
    
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Purpose of the Project</h2>
        <p className="text-gray-700 leading-relaxed text-lg">
          BharatVerse is a comprehensive multi-vendor e-commerce platform designed to revolutionize online retail. 
          It provides a seamless marketplace where multiple vendors can register, manage their stores, and sell products 
          to customers worldwide, all while maintaining a unified shopping experience.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <Package className="text-green-600 mb-4" size={32} />
          <h3 className="text-xl font-semibold mb-3">Multi-Vendor Support</h3>
          <p className="text-gray-600">Enable unlimited vendors to create stores and manage their inventory independently with full administrative control.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <Shield className="text-blue-600 mb-4" size={32} />
          <h3 className="text-xl font-semibold mb-3">Secure Transactions</h3>
          <p className="text-gray-600">Built-in security features ensure safe and reliable transactions for all users with industry-standard encryption.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <Activity className="text-purple-600 mb-4" size={32} />
          <h3 className="text-xl font-semibold mb-3">Real-time Analytics</h3>
          <p className="text-gray-600">Comprehensive dashboards provide insights into sales, inventory, and customer behavior with live updates.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <Zap className="text-yellow-600 mb-4" size={32} />
          <h3 className="text-xl font-semibold mb-3">Modern Architecture</h3>
          <p className="text-gray-600">Built with cutting-edge technologies for scalability, performance, and maintainability.</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Key Features</h2>
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <div className="grid md:grid-cols-2 gap-4">
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
              <span><strong>Vendor Management:</strong> Complete vendor onboarding, approval, and management system</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
              <span><strong>Product Catalog:</strong> Advanced product management with categories, images, and inventory tracking</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
              <span><strong>Order Management:</strong> End-to-end order processing from cart to delivery</span>
            </li>
          </ul>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
              <span><strong>Admin Dashboard:</strong> Comprehensive admin panel for platform management</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
              <span><strong>User Authentication:</strong> Secure authentication using Clerk for customers and JWT for vendors/admins</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
              <span><strong>Responsive Design:</strong> Mobile-first design with beautiful UI components</span>
            </li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Technology Highlights</h2>
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold">N</span>
            </div>
            <h4 className="font-semibold text-gray-800">Next.js 15</h4>
            <p className="text-sm text-gray-600">React Framework</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 font-bold">P</span>
            </div>
            <h4 className="font-semibold text-gray-800">PostgreSQL</h4>
            <p className="text-sm text-gray-600">Database</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-600 font-bold">P</span>
            </div>
            <h4 className="font-semibold text-gray-800">Prisma</h4>
            <p className="text-sm text-gray-600">ORM</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-cyan-600 font-bold">T</span>
            </div>
            <h4 className="font-semibold text-gray-800">TailwindCSS</h4>
            <p className="text-sm text-gray-600">Styling</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Problems It Solves</h2>
      <div className="bg-red-50 p-6 rounded-lg mb-8 border border-red-200">
        <div className="grid md:grid-cols-2 gap-4">
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <X className="text-red-500 flex-shrink-0" size={16} />
              <span><strong>Market Fragmentation:</strong> Unifies multiple vendors under one platform</span>
            </li>
            <li className="flex items-center gap-2">
              <X className="text-red-500 flex-shrink-0" size={16} />
              <span><strong>Complex Vendor Management:</strong> Streamlines vendor onboarding and management</span>
            </li>
            <li className="flex items-center gap-2">
              <X className="text-red-500 flex-shrink-0" size={16} />
              <span><strong>Inventory Chaos:</strong> Provides centralized inventory management</span>
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <X className="text-red-500 flex-shrink-0" size={16} />
              <span><strong>Customer Experience:</strong> Creates consistent shopping experience across all vendors</span>
            </li>
            <li className="flex items-center gap-2">
              <X className="text-red-500 flex-shrink-0" size={16} />
              <span><strong>Scalability Issues:</strong> Built to handle growth from day one</span>
            </li>
            <li className="flex items-center gap-2">
              <X className="text-red-500 flex-shrink-0" size={16} />
              <span><strong>Security Concerns:</strong> Enterprise-grade security for all users</span>
            </li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Why It Matters</h2>
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
        <p className="text-gray-700 leading-relaxed text-lg">
          In today's digital economy, small and medium businesses need accessible platforms to reach customers online. 
          BharatVerse democratizes e-commerce by providing enterprise-level features to businesses of all sizes, 
          fostering innovation and competition in the digital marketplace while ensuring customers have access 
          to a diverse range of products from verified vendors.
        </p>
        
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">SME Focus</div>
            <p className="text-sm text-gray-600">Empowering small businesses</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">Innovation</div>
            <p className="text-sm text-gray-600">Cutting-edge technology</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">Accessibility</div>
            <p className="text-sm text-gray-600">Easy-to-use platform</p>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="bg-gray-50 p-6 rounded-lg mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Navigation</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a href="#" onClick={() => setSelectedSection('api-reference')} className="flex items-center gap-3 p-3 bg-white rounded border hover:border-blue-300 transition">
            <Code className="text-blue-600" size={20} />
            <span className="font-medium">API Reference</span>
          </a>
          <a href="#" onClick={() => setSelectedSection('tech-stack')} className="flex items-center gap-3 p-3 bg-white rounded border hover:border-green-300 transition">
            <Server className="text-green-600" size={20} />
            <span className="font-medium">Tech Stack</span>
          </a>
          <a href="#" onClick={() => setSelectedSection('schema-design')} className="flex items-center gap-3 p-3 bg-white rounded border hover:border-purple-300 transition">
            <Database className="text-purple-600" size={20} />
            <span className="font-medium">Database Schema</span>
          </a>
          <a href="#" onClick={() => setSelectedSection('system-design')} className="flex items-center gap-3 p-3 bg-white rounded border hover:border-orange-300 transition">
            <Layers className="text-orange-600" size={20} />
            <span className="font-medium">System Design</span>
          </a>
          <a href="#" onClick={() => setSelectedSection('team')} className="flex items-center gap-3 p-3 bg-white rounded border hover:border-pink-300 transition">
            <Users className="text-pink-600" size={20} />
            <span className="font-medium">Meet the Team</span>
          </a>
          <a href="#" onClick={() => setSelectedSection('future-scope')} className="flex items-center gap-3 p-3 bg-white rounded border hover:border-yellow-300 transition">
            <Zap className="text-yellow-600" size={20} />
            <span className="font-medium">Future Plans</span>
          </a>
        </div>
      </div>
    </div>
  )
}

// Team Content Component  
const TeamContent = () => (
  <div className="prose prose-gray max-w-none">
    <h1 className="text-4xl font-bold text-gray-900 mb-6">Development Team</h1>
    
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Academic Information</h2>
      <p className="text-lg text-gray-700"><strong>Institution:</strong> Thakur College of Engineering and Technology</p>
      <p className="text-lg text-gray-700"><strong>Department:</strong> Artificial Intelligence & Machine Learning (AIML)</p>
      <p className="text-lg text-gray-700"><strong>Project Duration:</strong> 3 Months</p>
    </div>

    <div className="grid md:grid-cols-2 gap-8 mb-8">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
            A
          </div>
          <h3 className="text-2xl font-semibold text-gray-800">Adnan</h3>
          <p className="text-green-600 font-medium">Full-Stack Developer & Project Lead</p>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 mb-2">Key Contributions:</h4>
          <ul className="text-gray-600 space-y-2">
            <li>• Backend API Development (Node.js, Express.js)</li>
            <li>• Database Design & Implementation (PostgreSQL, Prisma)</li>
            <li>• Authentication Systems (Clerk, JWT)</li>
            <li>• Admin Dashboard & Analytics</li>
            <li>• DevOps & Deployment</li>
          </ul>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2">Technical Expertise:</h4>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Next.js</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">PostgreSQL</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Prisma</span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Node.js</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
            H
          </div>
          <h3 className="text-2xl font-semibold text-gray-800">Harsh</h3>
          <p className="text-purple-600 font-medium">Frontend Developer & UI/UX Designer</p>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 mb-2">Key Contributions:</h4>
          <ul className="text-gray-600 space-y-2">
            <li>• Frontend Development (React, Next.js)</li>
            <li>• UI/UX Design & Implementation</li>
            <li>• Component Architecture</li>
            <li>• State Management (Redux)</li>
            <li>• Responsive Design & Styling</li>
          </ul>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2">Technical Expertise:</h4>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">React</span>
            <span className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm">TailwindCSS</span>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Redux</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">JavaScript</span>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-gray-50 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Collaboration & Methodology</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="text-center">
          <GitBranch className="text-blue-600 mx-auto mb-2" size={32} />
          <h3 className="font-semibold">Version Control</h3>
          <p className="text-sm text-gray-600">Git-based collaboration with feature branches</p>
        </div>
        <div className="text-center">
          <Users className="text-green-600 mx-auto mb-2" size={32} />
          <h3 className="font-semibold">Agile Development</h3>
          <p className="text-sm text-gray-600">Sprint-based development with regular reviews</p>
        </div>
        <div className="text-center">
          <Code className="text-purple-600 mx-auto mb-2" size={32} />
          <h3 className="font-semibold">Code Reviews</h3>
          <p className="text-sm text-gray-600">Peer review process for code quality</p>
        </div>
      </div>
    </div>
  </div>
)

// API Reference Content Component
const APIContent = () => {
  const [liveApiData, setLiveApiData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLiveApiData = async () => {
      try {
        const response = await fetch('/api/docs/live')
        const data = await response.json()
        if (data.success) {
          setLiveApiData(data)
        }
      } catch (error) {
        console.error('Failed to fetch live API data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLiveApiData()
  }, [])

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800'
      case 'POST': return 'bg-blue-100 text-blue-800'
      case 'PUT': return 'bg-yellow-100 text-yellow-800'
      case 'PATCH': return 'bg-orange-100 text-orange-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="prose prose-gray max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">API Reference</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">API Reference</h1>
      
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Base URL</h2>
            <code className="bg-white px-3 py-1 rounded text-blue-700">
              {liveApiData?.metadata?.baseUrl || 'http://localhost:3000'}
            </code>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Total Endpoints</h2>
            <span className="text-2xl font-bold text-blue-600">
              {liveApiData?.totalEndpoints || 0}
            </span>
          </div>
        </div>
        <p className="text-blue-700 mt-4">
          All API endpoints are relative to this base URL. Authentication is required for most endpoints.
        </p>
      </div>

      {/* Authentication Info */}
      <div className="bg-yellow-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-yellow-800 mb-4">Authentication Methods</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">Clerk Authentication</h3>
            <p className="text-yellow-700 text-sm mb-2">Used for customer-facing endpoints</p>
            <code className="text-xs bg-yellow-100 px-2 py-1 rounded">Authorization: Bearer &lt;token&gt;</code>
          </div>
          <div className="bg-white p-4 rounded border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">JWT Cookies</h3>
            <p className="text-yellow-700 text-sm mb-2">Used for admin and store owner endpoints</p>
            <code className="text-xs bg-yellow-100 px-2 py-1 rounded">Cookie: admin-token or store-owner-token</code>
          </div>
        </div>
      </div>

      {/* Live API Endpoints */}
      {liveApiData?.endpoints?.map((category, index) => (
        <div key={index} className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            {category.category}
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm font-normal">
              {category.endpoints.length} endpoints
            </span>
          </h2>
          <div className="space-y-3">
            {category.endpoints.map((endpoint, endpointIndex) => (
              <div key={endpointIndex} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded text-sm font-medium ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </span>
                  <code className="bg-gray-100 px-3 py-1 rounded text-gray-800 flex-1">{endpoint.path}</code>
                </div>
                
                <p className="text-gray-600 mb-3">{endpoint.description}</p>
                
                {endpoint.parameters && (
                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-800 mb-2">Parameters:</h4>
                    {endpoint.parameters.body && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">Body:</span>
                        <div className="bg-gray-50 p-2 rounded mt-1">
                          {Object.entries(endpoint.parameters.body).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <code className="text-blue-600">{key}</code>: <span className="text-gray-600">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {endpoint.parameters.query && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">Query:</span>
                        <div className="bg-gray-50 p-2 rounded mt-1">
                          {Object.entries(endpoint.parameters.query).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <code className="text-blue-600">{key}</code>: <span className="text-gray-600">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {endpoint.parameters.path && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Path:</span>
                        <div className="bg-gray-50 p-2 rounded mt-1">
                          {Object.entries(endpoint.parameters.path).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <code className="text-blue-600">{key}</code>: <span className="text-gray-600">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {endpoint.responses && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Responses:</h4>
                    <div className="bg-gray-50 p-2 rounded">
                      {Object.entries(endpoint.responses).map(([code, description]) => (
                        <div key={code} className="text-sm">
                          <code className="text-green-600">{code}</code>: <span className="text-gray-600">{description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Rate Limiting Info */}
      <div className="bg-red-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-red-800 mb-2">Rate Limiting</h2>
        <p className="text-red-700">
          {liveApiData?.metadata?.rateLimiting?.description || 'API endpoints are rate limited to prevent abuse.'}
        </p>
        <p className="text-red-600 mt-2 text-sm">
          Default limit: {liveApiData?.metadata?.rateLimiting?.defaultLimit || '100 requests per minute per IP'}
        </p>
      </div>
    </div>
  )
}

// System Design Content Component
const SystemDesignContent = () => (
  <div className="prose prose-gray max-w-none">
    <h1 className="text-4xl font-bold text-gray-900 mb-6">System Design</h1>
    
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">High-Level Architecture</h2>
      <p className="text-gray-700">
        BharatVerse follows a modern three-tier architecture with clear separation of concerns, 
        ensuring scalability, maintainability, and security.
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <Globe className="text-blue-600 mb-4" size={32} />
        <h3 className="text-xl font-semibold mb-3">Presentation Layer</h3>
        <ul className="text-gray-600 space-y-2">
          <li>• Next.js Frontend</li>
          <li>• Server-Side Rendering</li>
          <li>• Responsive UI Components</li>
          <li>• State Management</li>
        </ul>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <Server className="text-green-600 mb-4" size={32} />
        <h3 className="text-xl font-semibold mb-3">Business Logic Layer</h3>
        <ul className="text-gray-600 space-y-2">
          <li>• API Routes</li>
          <li>• Authentication Logic</li>
          <li>• Business Rules</li>
          <li>• Data Validation</li>
        </ul>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <Database className="text-purple-600 mb-4" size={32} />
        <h3 className="text-xl font-semibold mb-3">Data Layer</h3>
        <ul className="text-gray-600 space-y-2">
          <li>• PostgreSQL Database</li>
          <li>• Prisma ORM</li>
          <li>• Data Models</li>
          <li>• Relationships</li>
        </ul>
      </div>
    </div>

    <h2 className="text-2xl font-semibold text-gray-800 mb-4">User Flow Diagrams</h2>
    
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Journey</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600 overflow-x-auto">
          <div className="text-center min-w-0 flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">1</div>
            <span>Browse Products</span>
          </div>
          <ChevronRight className="text-gray-400 flex-shrink-0" />
          <div className="text-center min-w-0 flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">2</div>
            <span>Add to Cart</span>
          </div>
          <ChevronRight className="text-gray-400 flex-shrink-0" />
          <div className="text-center min-w-0 flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">3</div>
            <span>Checkout</span>
          </div>
          <ChevronRight className="text-gray-400 flex-shrink-0" />
          <div className="text-center min-w-0 flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">4</div>
            <span>Payment</span>
          </div>
          <ChevronRight className="text-gray-400 flex-shrink-0" />
          <div className="text-center min-w-0 flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">5</div>
            <span>Order Placed</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Vendor Journey</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600 overflow-x-auto">
          <div className="text-center min-w-0 flex-shrink-0">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">1</div>
            <span>Store Registration</span>
          </div>
          <ChevronRight className="text-gray-400 flex-shrink-0" />
          <div className="text-center min-w-0 flex-shrink-0">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">2</div>
            <span>Admin Approval</span>
          </div>
          <ChevronRight className="text-gray-400 flex-shrink-0" />
          <div className="text-center min-w-0 flex-shrink-0">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">3</div>
            <span>Add Products</span>
          </div>
          <ChevronRight className="text-gray-400 flex-shrink-0" />
          <div className="text-center min-w-0 flex-shrink-0">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">4</div>
            <span>Manage Orders</span>
          </div>
          <ChevronRight className="text-gray-400 flex-shrink-0" />
          <div className="text-center min-w-0 flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">5</div>
            <span>Track Analytics</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Admin Workflow</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600 overflow-x-auto">
          <div className="text-center min-w-0 flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">1</div>
            <span>Monitor Platform</span>
          </div>
          <ChevronRight className="text-gray-400 flex-shrink-0" />
          <div className="text-center min-w-0 flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">2</div>
            <span>Review Stores</span>
          </div>
          <ChevronRight className="text-gray-400 flex-shrink-0" />
          <div className="text-center min-w-0 flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">3</div>
            <span>Approve/Reject</span>
          </div>
          <ChevronRight className="text-gray-400 flex-shrink-0" />
          <div className="text-center min-w-0 flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">4</div>
            <span>Manage Coupons</span>
          </div>
          <ChevronRight className="text-gray-400 flex-shrink-0" />
          <div className="text-center min-w-0 flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">5</div>
            <span>View Analytics</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Tech Stack Content Component
const TechStackContent = () => (
  <div className="prose prose-gray max-w-none">
    <h1 className="text-4xl font-bold text-gray-900 mb-6">Technology Stack</h1>
    
    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-8">
      <p className="text-gray-700 text-lg">
        BharatVerse is built using modern, industry-standard technologies that ensure scalability, 
        performance, and maintainability. Our tech stack represents the latest in web development best practices.
      </p>
    </div>

    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Frontend Technologies</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">Next.js 15.3.5</h3>
            <p className="text-gray-600 mb-3">React-based framework with server-side rendering, file-based routing, and API routes.</p>
            <div className="text-sm text-gray-500">
              <strong>Why:</strong> Full-stack capabilities, excellent performance, SEO-friendly
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-cyan-600 mb-2">TailwindCSS 4</h3>
            <p className="text-gray-600 mb-3">Utility-first CSS framework for rapid UI development and consistent design.</p>
            <div className="text-sm text-gray-500">
              <strong>Why:</strong> Fast development, consistent design system, small bundle size
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Redux Toolkit</h3>
            <p className="text-gray-600 mb-3">State management for complex application state, especially cart and user data.</p>
            <div className="text-sm text-gray-500">
              <strong>Why:</strong> Predictable state updates, debugging tools, time-travel debugging
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-orange-600 mb-2">Lucide React</h3>
            <p className="text-gray-600 mb-3">Beautiful, customizable icon library with consistent design language.</p>
            <div className="text-sm text-gray-500">
              <strong>Why:</strong> Lightweight, consistent icons, React-optimized
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Backend Technologies</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-green-600 mb-2">Node.js Runtime</h3>
            <p className="text-gray-600 mb-3">JavaScript runtime built on Chrome's V8 engine for server-side development.</p>
            <div className="text-sm text-gray-500">
              <strong>Why:</strong> Same language for frontend/backend, excellent performance, large ecosystem
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-purple-600 mb-2">Prisma ORM</h3>
            <p className="text-gray-600 mb-3">Next-generation ORM for type-safe database access and migrations.</p>
            <div className="text-sm text-gray-500">
              <strong>Why:</strong> Type safety, auto-generated client, excellent developer experience
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">PostgreSQL</h3>
            <p className="text-gray-600 mb-3">Advanced open-source relational database with strong consistency and ACID compliance.</p>
            <div className="text-sm text-gray-500">
              <strong>Why:</strong> Reliability, advanced features, excellent performance for complex queries
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-yellow-600 mb-2">JWT</h3>
            <p className="text-gray-600 mb-3">JSON Web Tokens for stateless authentication and authorization.</p>
            <div className="text-sm text-gray-500">
              <strong>Why:</strong> Stateless, secure, standard for API authentication
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Authentication & Security</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-indigo-600 mb-2">Clerk Authentication</h3>
            <p className="text-gray-600 mb-3">Complete authentication solution for customer-facing features.</p>
            <div className="text-sm text-gray-500">
              <strong>Features:</strong> Social login, user management, security best practices
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">bcryptjs</h3>
            <p className="text-gray-600 mb-3">Password hashing library for secure password storage.</p>
            <div className="text-sm text-gray-500">
              <strong>Features:</strong> Salt rounds, secure hashing, password verification
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Additional Libraries</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h4 className="font-semibold text-green-600 mb-2">React Hot Toast</h4>
            <p className="text-sm text-gray-600">Beautiful toast notifications</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h4 className="font-semibold text-blue-600 mb-2">Recharts</h4>
            <p className="text-sm text-gray-600">Responsive charts for analytics</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h4 className="font-semibold text-purple-600 mb-2">date-fns</h4>
            <p className="text-sm text-gray-600">Modern date utility library</p>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-gray-50 p-6 rounded-lg mt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Architecture Benefits</h2>
      <ul className="space-y-2 text-gray-700">
        <li>• <strong>Scalability:</strong> Horizontal scaling with stateless architecture</li>
        <li>• <strong>Performance:</strong> SSR, optimized bundles, and efficient database queries</li>
        <li>• <strong>Developer Experience:</strong> Type safety, hot reload, modern tooling</li>
        <li>• <strong>Maintainability:</strong> Clean architecture, separation of concerns</li>
        <li>• <strong>Security:</strong> Industry-standard authentication and data protection</li>
      </ul>
    </div>
  </div>
)

// Continue with other components...
// Project History Content Component
const ProjectHistoryContent = () => (
  <div className="prose prose-gray max-w-none">
    <h1 className="text-4xl font-bold text-gray-900 mb-6">Project History & Timeline</h1>
    
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Project Evolution</h2>
      <p className="text-gray-700">
        BharatVerse underwent three major development phases over 39 days (August 12 - September 20, 2025), evolving from a simple 
        static website to a full-featured multi-vendor e-commerce platform with advanced email systems.
      </p>
    </div>

    <div className="space-y-8">
      <div className="relative">
        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300"></div>
        
        <div className="relative flex items-start space-x-4 pb-8">
          <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
            1
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex-1">
            <h3 className="text-xl font-semibold text-red-600 mb-2">Phase 1: Full Stack Foundation</h3>
            <p className="text-gray-600 mb-3"><strong>Duration:</strong> August 12-19, 2025 (8 days)</p>
            <p className="text-gray-700 mb-4">Initial development using vanilla HTML, CSS, and JavaScript to establish core functionality and user interface concepts.</p>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800">Key Achievements:</h4>
              <ul className="text-gray-600 ml-4">
                <li>• Basic product catalog design</li>
                <li>• Static user interface components</li>
                <li>• Initial layout and styling</li>
                <li>• Core functionality prototyping</li>
                <li>• Shopping cart with local storage</li>
                <li>• Responsive design implementation</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="relative flex items-start space-x-4 pb-8">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            2
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex-1">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Phase 2: MERN Stack Implementation</h3>
            <p className="text-gray-600 mb-3"><strong>Duration:</strong> August 20-31, 2025 (12 days)</p>
            <p className="text-gray-700 mb-4">Transition to MERN stack (MongoDB, Express.js, React, Node.js) to add dynamic functionality and backend capabilities.</p>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800">Key Achievements:</h4>
              <ul className="text-gray-600 ml-4">
                <li>• React component architecture</li>
                <li>• Express.js API development</li>
                <li>• MongoDB database integration</li>
                <li>• JWT-based authentication system</li>
                <li>• Multi-vendor marketplace features</li>
                <li>• Payment gateway integration</li>
                <li>• Real-time order tracking</li>
                <li>• Advanced admin panel</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="relative flex items-start space-x-4">
          <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
            3
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex-1">
            <h3 className="text-xl font-semibold text-green-600 mb-2">Phase 3: Next.js & Modern Stack</h3>
            <p className="text-gray-600 mb-3"><strong>Duration:</strong> September 1-20, 2025 (20 days)</p>
            <p className="text-gray-700 mb-4">Complete rebuild using Next.js, PostgreSQL, and Prisma for production-ready performance and scalability with advanced email systems.</p>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800">Key Achievements:</h4>
              <ul className="text-gray-600 ml-4">
                <li>• Next.js 15 with App Router</li>
                <li>• PostgreSQL with Prisma ORM</li>
                <li>• Multi-vendor architecture</li>
                <li>• Advanced authentication (Clerk + JWT)</li>
                <li>• Comprehensive email system with OAuth2</li>
                <li>• Store analytics and dashboard</li>
                <li>• Advanced search and filtering</li>
                <li>• Documentation system</li>
                <li>• Security enhancements</li>
                <li>• Performance optimizations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-gray-50 p-6 rounded-lg mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Weekly Milestones</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Week 1 (Aug 12-18)</h4>
          <p className="text-sm text-gray-600">Vanilla Stack Foundation & Basic UI</p>
        </div>
        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Week 2 (Aug 19-25)</h4>
          <p className="text-sm text-gray-600">MERN Stack Migration & Core Features</p>
        </div>
        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Week 3 (Aug 26-Sep 1)</h4>
          <p className="text-sm text-gray-600">MERN Completion & Next.js Planning</p>
        </div>
        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Week 4 (Sep 2-8)</h4>
          <p className="text-sm text-gray-600">Next.js Migration & Database Setup</p>
        </div>
        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Week 5 (Sep 9-15)</h4>
          <p className="text-sm text-gray-600">Advanced Features & Analytics</p>
        </div>
        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Week 6 (Sep 16-20)</h4>
          <p className="text-sm text-gray-600">Email System & Final Optimization</p>
        </div>
      </div>
    </div>
  </div>
)

// Data Flow Content Component
const DataFlowContent = () => (
  <div className="prose prose-gray max-w-none">
    <h1 className="text-4xl font-bold text-gray-900 mb-6">Data Flow Diagrams</h1>
    
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">System Data Flow</h2>
      <p className="text-gray-700">
        Understanding how data flows through the BharatVerse system helps visualize the 
        interactions between different components and user roles.
      </p>
    </div>

    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Context Diagram (Level 0)</h2>
        <div className="bg-white p-8 rounded-lg border border-gray-200">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="w-48 h-32 bg-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-center mb-4">
                <div>
                  <h3 className="font-bold text-blue-800">BharatVerse System</h3>
                  <p className="text-sm text-blue-600">E-commerce Platform</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-8 mt-8">
                <div className="text-center">
                  <div className="w-24 h-16 bg-green-100 border border-green-300 rounded flex items-center justify-center mb-2">
                    <span className="text-sm font-medium text-green-800">Customers</span>
                  </div>
                  <div className="text-xs text-gray-600">Browse, Order, Review</div>
                </div>
                
                <div className="text-center">
                  <div className="w-24 h-16 bg-purple-100 border border-purple-300 rounded flex items-center justify-center mb-2">
                    <span className="text-sm font-medium text-purple-800">Vendors</span>
                  </div>
                  <div className="text-xs text-gray-600">Manage Store, Products</div>
                </div>
                
                <div className="text-center">
                  <div className="w-24 h-16 bg-red-100 border border-red-300 rounded flex items-center justify-center mb-2">
                    <span className="text-sm font-medium text-red-800">Admins</span>
                  </div>
                  <div className="text-xs text-gray-600">Monitor, Approve</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Level 1 DFD - Main Processes</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-full h-24 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center mb-2">
                <div>
                  <div className="font-semibold text-blue-800">1.0</div>
                  <div className="text-sm text-blue-600">User Management</div>
                </div>
              </div>
              <ul className="text-xs text-gray-600 text-left">
                <li>• Registration</li>
                <li>• Authentication</li>
                <li>• Profile Management</li>
              </ul>
            </div>
            
            <div className="text-center">
              <div className="w-full h-24 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center mb-2">
                <div>
                  <div className="font-semibold text-green-800">2.0</div>
                  <div className="text-sm text-green-600">Product Management</div>
                </div>
              </div>
              <ul className="text-xs text-gray-600 text-left">
                <li>• Product Catalog</li>
                <li>• Inventory Control</li>
                <li>• Category Management</li>
              </ul>
            </div>
            
            <div className="text-center">
              <div className="w-full h-24 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-center mb-2">
                <div>
                  <div className="font-semibold text-purple-800">3.0</div>
                  <div className="text-sm text-purple-600">Order Processing</div>
                </div>
              </div>
              <ul className="text-xs text-gray-600 text-left">
                <li>• Cart Management</li>
                <li>• Checkout Process</li>
                <li>• Order Tracking</li>
              </ul>
            </div>
            
            <div className="text-center">
              <div className="w-full h-24 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-center mb-2">
                <div>
                  <div className="font-semibold text-orange-800">4.0</div>
                  <div className="text-sm text-orange-600">Store Management</div>
                </div>
              </div>
              <ul className="text-xs text-gray-600 text-left">
                <li>• Store Registration</li>
                <li>• Approval Workflow</li>
                <li>• Analytics Dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Stores</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">D1: Users</h4>
            <p className="text-sm text-gray-600">Customer, vendor, and admin data</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">D2: Products</h4>
            <p className="text-sm text-gray-600">Product catalog and inventory</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">D3: Orders</h4>
            <p className="text-sm text-gray-600">Order history and tracking</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">D4: Stores</h4>
            <p className="text-sm text-gray-600">Vendor store information</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">D5: Addresses</h4>
            <p className="text-sm text-gray-600">Shipping and billing addresses</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">D6: Reviews</h4>
            <p className="text-sm text-gray-600">Product ratings and reviews</p>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Schema Design Content Component
const SchemaDesignContent = () => {
  const [schemaData, setSchemaData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSchemaData = async () => {
      try {
        const response = await fetch('/api/docs?type=schema')
        const data = await response.json()
        if (data.success) {
          setSchemaData(data.data.schema)
        }
      } catch (error) {
        console.error('Failed to fetch schema data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSchemaData()
  }, [])

  // Fallback static schema data
  const staticSchemaData = [
    {
      name: 'User',
      fields: [
        { name: 'id', type: 'String', isPrimaryKey: true, attributes: '@id' },
        { name: 'name', type: 'String', attributes: '' },
        { name: 'email', type: 'String', attributes: '' },
        { name: 'image', type: 'String', attributes: '' },
        { name: 'cart', type: 'Json', attributes: '@default("{}")' }
      ],
      relations: [
        { field: 'ratings', type: 'Rating[]', isArray: true },
        { field: 'Address', type: 'Address[]', isArray: true },
        { field: 'store', type: 'Store?', isArray: false },
        { field: 'buyerOrders', type: 'Order[]', isArray: true }
      ]
    },
    {
      name: 'Product',
      fields: [
        { name: 'id', type: 'String', isPrimaryKey: true, attributes: '@id @default(cuid())' },
        { name: 'name', type: 'String', attributes: '' },
        { name: 'description', type: 'String', attributes: '' },
        { name: 'mrp', type: 'Float', attributes: '' },
        { name: 'price', type: 'Float', attributes: '' },
        { name: 'images', type: 'String[]', attributes: '' },
        { name: 'category', type: 'String', attributes: '' },
        { name: 'inStock', type: 'Boolean', attributes: '@default(true)' },
        { name: 'stockQuantity', type: 'Int', attributes: '@default(0)' },
        { name: 'storeId', type: 'String', isForeignKey: true, attributes: '' }
      ],
      relations: [
        { field: 'store', type: 'Store', isArray: false },
        { field: 'ratings', type: 'Rating[]', isArray: true },
        { field: 'orderItems', type: 'OrderItem[]', isArray: true }
      ]
    },
    {
      name: 'Store',
      fields: [
        { name: 'id', type: 'String', isPrimaryKey: true, attributes: '@id @default(cuid())' },
        { name: 'userId', type: 'String', isForeignKey: true, attributes: '@unique' },
        { name: 'name', type: 'String', attributes: '' },
        { name: 'description', type: 'String', attributes: '' },
        { name: 'username', type: 'String', attributes: '@unique' },
        { name: 'address', type: 'String', attributes: '' },
        { name: 'status', type: 'StoreStatus', attributes: '@default(pending)' },
        { name: 'isActive', type: 'Boolean', attributes: '@default(true)' }
      ],
      relations: [
        { field: 'user', type: 'User', isArray: false },
        { field: 'products', type: 'Product[]', isArray: true }
      ]
    },
    {
      name: 'Order',
      fields: [
        { name: 'id', type: 'String', isPrimaryKey: true, attributes: '@id @default(cuid())' },
        { name: 'userId', type: 'String', isForeignKey: true, attributes: '' },
        { name: 'status', type: 'OrderStatus', attributes: '@default(pending)' },
        { name: 'totalAmount', type: 'Float', attributes: '' },
        { name: 'addressId', type: 'String', isForeignKey: true, attributes: '' },
        { name: 'createdAt', type: 'DateTime', attributes: '@default(now())' },
        { name: 'updatedAt', type: 'DateTime', attributes: '@updatedAt' }
      ],
      relations: [
        { field: 'user', type: 'User', isArray: false },
        { field: 'address', type: 'Address', isArray: false },
        { field: 'orderItems', type: 'OrderItem[]', isArray: true }
      ]
    }
  ]

  const currentSchemaData = schemaData || staticSchemaData

  if (loading) {
    return (
      <div className="prose prose-gray max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Database Schema Design</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Database Schema Design</h1>
      
      <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Database Architecture</h2>
        <p className="text-gray-700">
          BharatVerse uses PostgreSQL with Prisma ORM for type-safe database operations. 
          The schema is designed to support multi-vendor operations with proper relationships and constraints.
        </p>
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white p-4 rounded border border-green-200">
            <div className="text-2xl font-bold text-green-600">{currentSchemaData.length}</div>
            <div className="text-sm text-gray-600">Database Models</div>
          </div>
          <div className="bg-white p-4 rounded border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">PostgreSQL</div>
            <div className="text-sm text-gray-600">Database Engine</div>
          </div>
          <div className="bg-white p-4 rounded border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">Prisma</div>
            <div className="text-sm text-gray-600">ORM & Type Safety</div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Database Models</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {currentSchemaData.map((model, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${
                    index % 4 === 0 ? 'bg-blue-500' :
                    index % 4 === 1 ? 'bg-green-500' :
                    index % 4 === 2 ? 'bg-purple-500' : 'bg-orange-500'
                  }`}></span>
                  {model.name}
                </h3>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Fields:</h4>
                  <div className="space-y-1 text-sm max-h-64 overflow-y-auto">
                    {model.fields?.map((field, fieldIndex) => (
                      <div key={fieldIndex} className="flex justify-between items-center py-1 px-2 hover:bg-gray-50 rounded">
                        <span className={`font-medium ${
                          field.isPrimaryKey ? 'text-red-600' :
                          field.isForeignKey ? 'text-blue-600' :
                          'text-gray-800'
                        }`}>
                          {field.name}
                          {field.isPrimaryKey && <span className="ml-1 text-xs text-red-500">(PK)</span>}
                          {field.isForeignKey && <span className="ml-1 text-xs text-blue-500">(FK)</span>}
                        </span>
                        <span className="text-gray-600 text-xs">{field.type}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {model.relations && model.relations.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-2">Relations:</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      {model.relations.map((relation, relIndex) => (
                        <div key={relIndex} className="flex justify-between">
                          <span className="font-medium">{relation.field}</span>
                          <span className={relation.isArray ? 'text-orange-600' : 'text-purple-600'}>
                            {relation.type} {relation.isArray ? '(1:N)' : '(1:1)'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Entity Relationship Overview</h2>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Primary Relationships</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    User ↔ Store (One-to-One)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Store ↔ Product (One-to-Many)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    User ↔ Order (One-to-Many)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Order ↔ OrderItem (One-to-Many)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Product ↔ OrderItem (One-to-Many)
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Key Constraints</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Unique email per user</li>
                  <li>• Store approval required for selling</li>
                  <li>• Product belongs to exactly one store</li>
                  <li>• Order must have valid address</li>
                  <li>• Rating requires valid user and product</li>
                  <li>• Soft delete for data integrity</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Database Features</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <Database className="text-green-600 mb-2" size={24} />
              <h4 className="font-semibold text-green-800 mb-2">ACID Compliance</h4>
              <p className="text-sm text-green-700">Ensures data integrity and consistency across all transactions</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <Shield className="text-blue-600 mb-2" size={24} />
              <h4 className="font-semibold text-blue-800 mb-2">Type Safety</h4>
              <p className="text-sm text-blue-700">Prisma provides full TypeScript support and compile-time checks</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <GitBranch className="text-purple-600 mb-2" size={24} />
              <h4 className="font-semibold text-purple-800 mb-2">Migrations</h4>
              <p className="text-sm text-purple-700">Version-controlled schema evolution with automatic migrations</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Schema Commands</h2>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Generate Prisma Client:</h4>
              <code className="bg-gray-800 text-green-400 px-3 py-2 rounded block">npm run db:generate</code>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Push Schema to Database:</h4>
              <code className="bg-gray-800 text-green-400 px-3 py-2 rounded block">npm run db:push</code>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Create and Run Migration:</h4>
              <code className="bg-gray-800 text-green-400 px-3 py-2 rounded block">npm run db:migrate</code>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Seed Database:</h4>
              <code className="bg-gray-800 text-green-400 px-3 py-2 rounded block">npm run db:seed</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Deployment Content Component
const DeploymentContent = () => (
  <div className="prose prose-gray max-w-none">
    <h1 className="text-4xl font-bold text-gray-900 mb-6">Deployment & Hosting</h1>
    
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Deployment Strategy</h2>
      <p className="text-gray-700">
        BharatVerse is designed for scalable deployment using modern cloud platforms 
        with containerization and CI/CD best practices.
      </p>
    </div>

    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Deployment Options</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <Rocket className="text-blue-600 mb-4" size={32} />
            <h3 className="text-lg font-semibold text-blue-600 mb-3">Vercel (Recommended)</h3>
            <ul className="text-gray-600 space-y-2 mb-4">
              <li>• Optimized for Next.js applications</li>
              <li>• Automatic deployments from Git</li>
              <li>• Global CDN and edge functions</li>
              <li>• Built-in analytics and monitoring</li>
            </ul>
            <div className="bg-blue-50 p-3 rounded text-sm">
              <strong>Best for:</strong> Production deployments with high performance requirements
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <Globe className="text-green-600 mb-4" size={32} />
            <h3 className="text-lg font-semibold text-green-600 mb-3">Docker Container</h3>
            <ul className="text-gray-600 space-y-2 mb-4">
              <li>• Consistent deployment environment</li>
              <li>• Portable across cloud providers</li>
              <li>• Scalable with orchestration</li>
              <li>• Local development parity</li>
            </ul>
            <div className="bg-green-50 p-3 rounded text-sm">
              <strong>Best for:</strong> Enterprise deployments and multi-cloud strategies
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Environment Configuration</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Required Environment Variables</h3>
          <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm">
{`# Database
DATABASE_URL="postgresql://user:password@host:port/database"
DIRECT_URL="postgresql://user:password@host:port/database"

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
JWT_SECRET="your-super-secret-key"

# Application
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXT_PUBLIC_CURRENCY_SYMBOL="₹"

# Upload Configuration  
NEXT_PUBLIC_MAX_FILE_SIZE="5MB"
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp"`}
            </pre>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">CI/CD Pipeline</h2>
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">GitHub Actions Workflow</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600 overflow-x-auto">
              <div className="text-center min-w-0 flex-shrink-0">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <GitBranch size={20} className="text-blue-600" />
                </div>
                <span>Code Push</span>
              </div>
              <ChevronRight className="text-gray-400 flex-shrink-0" />
              <div className="text-center min-w-0 flex-shrink-0">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                  <Code size={20} className="text-yellow-600" />
                </div>
                <span>Build & Test</span>
              </div>
              <ChevronRight className="text-gray-400 flex-shrink-0" />
              <div className="text-center min-w-0 flex-shrink-0">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <Database size={20} className="text-purple-600" />
                </div>
                <span>DB Migration</span>
              </div>
              <ChevronRight className="text-gray-400 flex-shrink-0" />
              <div className="text-center min-w-0 flex-shrink-0">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <Rocket size={20} className="text-green-600" />
                </div>
                <span>Deploy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Security & Backup</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <Shield className="text-red-600 mb-4" size={32} />
            <h3 className="text-lg font-semibold text-red-600 mb-3">Security Measures</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• HTTPS enforcement</li>
              <li>• Environment variable encryption</li>
              <li>• JWT token security</li>
              <li>• Input validation and sanitization</li>
              <li>• Rate limiting</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <Database className="text-purple-600 mb-4" size={32} />
            <h3 className="text-lg font-semibold text-purple-600 mb-3">Backup Strategy</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• Automated database backups</li>
              <li>• Point-in-time recovery</li>
              <li>• Cross-region replication</li>
              <li>• Version-controlled migrations</li>
              <li>• Disaster recovery plan</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Future Scope Content Component
const FutureScopeContent = () => (
  <div className="prose prose-gray max-w-none">
    <h1 className="text-4xl font-bold text-gray-900 mb-6">Future Scope & Improvements</h1>
    
    <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-lg mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Vision for Growth</h2>
      <p className="text-gray-700">
        BharatVerse is designed with scalability and extensibility in mind. Our roadmap includes 
        cutting-edge features and improvements to enhance user experience and business capabilities.
      </p>
    </div>

    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Short-term Improvements (3-6 months)</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <Zap className="text-yellow-600 mb-4" size={32} />
            <h3 className="text-lg font-semibold text-yellow-600 mb-3">Performance Optimization</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• Image optimization and CDN integration</li>
              <li>• Database query optimization</li>
              <li>• Implement caching strategies</li>
              <li>• Bundle size reduction</li>
              <li>• Progressive Web App features</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <Package className="text-blue-600 mb-4" size={32} />
            <h3 className="text-lg font-semibold text-blue-600 mb-3">Enhanced Features</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• Advanced search and filtering</li>
              <li>• Wishlist functionality</li>
              <li>• Product comparison tool</li>
              <li>• Bulk order management</li>
              <li>• Enhanced analytics dashboard</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Medium-term Goals (6-12 months)</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <Globe className="text-green-600 mb-4" size={32} />
            <h3 className="text-lg font-semibold text-green-600 mb-3">Multi-language Support</h3>
            <ul className="text-gray-600 space-y-2 text-sm">
              <li>• Internationalization (i18n)</li>
              <li>• Multi-currency support</li>
              <li>• Region-specific features</li>
              <li>• Local payment gateways</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <Activity className="text-purple-600 mb-4" size={32} />
            <h3 className="text-lg font-semibold text-purple-600 mb-3">AI Integration</h3>
            <ul className="text-gray-600 space-y-2 text-sm">
              <li>• Personalized recommendations</li>
              <li>• Chatbot customer support</li>
              <li>• Inventory forecasting</li>
              <li>• Price optimization</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <Rocket className="text-red-600 mb-4" size={32} />
            <h3 className="text-lg font-semibold text-red-600 mb-3">Mobile Apps</h3>
            <ul className="text-gray-600 space-y-2 text-sm">
              <li>• React Native development</li>
              <li>• Push notifications</li>
              <li>• Offline functionality</li>
              <li>• Native integrations</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Long-term Vision (1-2 years)</h2>
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Marketplace Ecosystem</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="text-gray-600 space-y-2">
                <li>• Third-party integration marketplace</li>
                <li>• API marketplace for developers</li>
                <li>• Plugin architecture for extensions</li>
                <li>• White-label solutions</li>
              </ul>
              <ul className="text-gray-600 space-y-2">
                <li>• Affiliate marketing program</li>
                <li>• Subscription-based services</li>
                <li>• Social commerce features</li>
                <li>• Marketplace for digital products</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Advanced Technology Integration</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="text-gray-600 space-y-2">
                <li>• Blockchain for supply chain tracking</li>
                <li>• IoT integration for smart inventory</li>
                <li>• AR/VR product visualization</li>
                <li>• Voice commerce capabilities</li>
              </ul>
              <ul className="text-gray-600 space-y-2">
                <li>• Machine learning for fraud detection</li>
                <li>• Predictive analytics</li>
                <li>• Automated customer service</li>
                <li>• Smart contract integration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Scaling Roadmap</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="border-r border-gray-200 pr-4">
              <div className="text-2xl font-bold text-blue-600 mb-2">Phase 1</div>
              <h4 className="font-semibold mb-2">Foundation</h4>
              <p className="text-sm text-gray-600">Core platform stability and basic features</p>
            </div>
            <div className="border-r border-gray-200 pr-4">
              <div className="text-2xl font-bold text-green-600 mb-2">Phase 2</div>
              <h4 className="font-semibold mb-2">Growth</h4>
              <p className="text-sm text-gray-600">Enhanced features and user experience</p>
            </div>
            <div className="border-r border-gray-200 pr-4">
              <div className="text-2xl font-bold text-purple-600 mb-2">Phase 3</div>
              <h4 className="font-semibold mb-2">Scale</h4>
              <p className="text-sm text-gray-600">AI integration and global expansion</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 mb-2">Phase 4</div>
              <h4 className="font-semibold mb-2">Innovation</h4>
              <p className="text-sm text-gray-600">Cutting-edge technology adoption</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-gray-50 p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Contributing to the Future</h2>
      <p className="text-gray-700 mb-4">
        We welcome contributions from developers, designers, and business experts to help shape the future of BharatVerse. 
        Join our community and be part of the next generation of e-commerce platforms.
      </p>
      <div className="flex items-center gap-4">
        <a href="https://github.com/GreatStackDev/goCart" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition">
          <ExternalLink size={16} />
          GitHub Repository
        </a>
        <span className="text-gray-600">|</span>
        <span className="text-gray-600">Documentation</span>
        <span className="text-gray-600">|</span>
        <span className="text-gray-600">Community Discord</span>
      </div>
    </div>
  </div>
)

// Recent Changes Content Component
const RecentChangesContent = () => {
  const recentChanges = [
    // September 20, 2025 - Email System Implementation Day
    {
      id: 1,
      date: '2025-09-20',
      type: 'feature',
      title: 'Comprehensive Email System Implementation',
      description: 'Implemented complete email notification system with Gmail OAuth2 integration for all user types (customers, store owners, admin) with professional responsive email templates',
      author: 'Adnan',
      impact: 'high'
    },
    {
      id: 2,
      date: '2025-09-20',
      type: 'feature',
      title: 'Store Owner Password Reset System',
      description: 'Added secure forgot password functionality with 6-digit OTP verification, email notifications, and multi-step password reset interface for store owners',
      author: 'Adnan',
      impact: 'high'
    },
    {
      id: 3,
      date: '2025-09-20',
      type: 'security',
      title: 'OAuth2 Email Security Enhancement',
      description: 'Integrated Gmail OAuth2 authentication for secure email sending with refresh token management and encrypted credential storage',
      author: 'Adnan',
      impact: 'high'
    },
    {
      id: 4,
      date: '2025-09-20',
      type: 'feature',
      title: 'Automated Email Notifications',
      description: 'Added automatic email notifications for order confirmations, status updates, store approvals/rejections, and all important platform events',
      author: 'Adnan',
      impact: 'high'
    },
    {
      id: 5,
      date: '2025-09-20',
      type: 'enhancement',
      title: 'Database Schema Enhancement',
      description: 'Extended Store model with resetToken and resetTokenExpiry fields for secure password recovery with proper migration scripts',
      author: 'Adnan',
      impact: 'medium'
    },
    {
      id: 6,
      date: '2025-09-20',
      type: 'feature',
      title: 'Professional Email Templates',
      description: 'Created 7 responsive email templates including order confirmations, store notifications, password reset, and success messages with consistent branding',
      author: 'Adnan',
      impact: 'medium'
    },

    // September 19, 2025
    {
      id: 7,
      date: '2025-09-19',
      type: 'feature',
      title: 'Profile Management System',
      description: 'Added comprehensive profile editing for both customers and store owners with image upload capabilities',
      author: 'Adnan',
      impact: 'high'
    },
    {
      id: 8,
      date: '2025-09-19',
      type: 'enhancement',
      title: 'Advanced Image Processing',
      description: 'Implemented image compression, resizing, and format optimization for profile pictures and product images',
      author: 'Harsh',
      impact: 'medium'
    },
    {
      id: 9,
      date: '2025-09-19',
      type: 'fix',
      title: 'Profile Validation Improvements',
      description: 'Enhanced form validation for profile updates with real-time feedback and error handling',
      author: 'Adnan',
      impact: 'low'
    },

    // September 18, 2025
    {
      id: 10,
      date: '2025-09-18',
      type: 'feature',
      title: 'Documentation System',
      description: 'Implemented auto-generating documentation with live data fetching and interactive navigation',
      author: 'Adnan',
      impact: 'high'
    },
    {
      id: 11,
      date: '2025-09-18',
      type: 'enhancement',
      title: 'Responsive Design Improvements',
      description: 'Enhanced mobile responsiveness across all pages with better touch interactions',
      author: 'Harsh',
      impact: 'medium'
    },
    {
      id: 12,
      date: '2025-09-18',
      type: 'feature',
      title: 'Interactive API Documentation',
      description: 'Added live API documentation with code examples and testing capabilities',
      author: 'Adnan',
      impact: 'medium'
    },

    // September 17, 2025
    {
      id: 13,
      date: '2025-09-17',
      type: 'feature',
      title: 'Advanced Search & Filtering',
      description: 'Implemented multi-criteria product search with category filters and price ranges',
      author: 'Adnan',
      impact: 'high'
    },
    {
      id: 14,
      date: '2025-09-17',
      type: 'enhancement',
      title: 'Search Performance Optimization',
      description: 'Added debouncing and pagination to search functionality for better performance',
      author: 'Harsh',
      impact: 'medium'
    },
    {
      id: 15,
      date: '2025-09-17',
      type: 'feature',
      title: 'Search History & Suggestions',
      description: 'Implemented search history tracking and intelligent search suggestions',
      author: 'Adnan',
      impact: 'low'
    },

    // September 16, 2025
    {
      id: 16,
      date: '2025-09-16',
      type: 'fix',
      title: 'Cart State Management',
      description: 'Fixed cart persistence issues and improved Redux state synchronization',
      author: 'Harsh',
      impact: 'medium'
    },
    {
      id: 17,
      date: '2025-09-16',
      type: 'enhancement',
      title: 'Cart Performance Improvements',
      description: 'Optimized cart operations and added loading states for better user experience',
      author: 'Adnan',
      impact: 'medium'
    },
    {
      id: 18,
      date: '2025-09-16',
      type: 'feature',
      title: 'Cart Item Recommendations',
      description: 'Added related product suggestions in cart and checkout pages',
      author: 'Harsh',
      impact: 'low'
    },

    // September 15, 2025
    {
      id: 19,
      date: '2025-09-15',
      type: 'feature',
      title: 'Store Analytics Dashboard',
      description: 'Added comprehensive analytics with charts and real-time data for store owners',
      author: 'Adnan',
      impact: 'high'
    },
    {
      id: 20,
      date: '2025-09-15',
      type: 'feature',
      title: 'Revenue Tracking System',
      description: 'Implemented detailed revenue analytics with daily, weekly, and monthly breakdowns',
      author: 'Adnan',
      impact: 'high'
    },
    {
      id: 21,
      date: '2025-09-15',
      type: 'enhancement',
      title: 'Interactive Charts Integration',
      description: 'Added Chart.js integration for interactive data visualization in analytics',
      author: 'Harsh',
      impact: 'medium'
    },

    // September 14, 2025
    {
      id: 22,
      date: '2025-09-14',
      type: 'security',
      title: 'Authentication Enhancement',
      description: 'Strengthened JWT token validation and added additional security layers',
      author: 'Adnan',
      impact: 'high'
    },
    {
      id: 23,
      date: '2025-09-14',
      type: 'security',
      title: 'Rate Limiting Implementation',
      description: 'Added rate limiting to API endpoints to prevent abuse and ensure system stability',
      author: 'Adnan',
      impact: 'high'
    },
    {
      id: 24,
      date: '2025-09-14',
      type: 'security',
      title: 'Input Sanitization',
      description: 'Enhanced input validation and sanitization across all user inputs',
      author: 'Harsh',
      impact: 'medium'
    },

    // September 13, 2025
    {
      id: 25,
      date: '2025-09-13',
      type: 'feature',
      title: 'Order Management System',
      description: 'Implemented complete order lifecycle management with status tracking',
      author: 'Adnan',
      impact: 'high'
    },
    {
      id: 26,
      date: '2025-09-13',
      type: 'feature',
      title: 'Order Status Notifications',
      description: 'Added real-time order status updates and notification system',
      author: 'Harsh',
      impact: 'medium'
    },
    {
      id: 27,
      date: '2025-09-13',
      type: 'enhancement',
      title: 'Order History Pagination',
      description: 'Implemented efficient pagination for order history with search and filters',
      author: 'Adnan',
      impact: 'low'
    },

    // September 12, 2025
    {
      id: 28,
      date: '2025-09-12',
      type: 'enhancement',
      title: 'UI Component Library',
      description: 'Created reusable UI components with consistent design system',
      author: 'Harsh',
      impact: 'medium'
    },
    {
      id: 29,
      date: '2025-09-12',
      type: 'enhancement',
      title: 'Component Documentation',
      description: 'Added comprehensive documentation for all UI components with examples',
      author: 'Harsh',
      impact: 'low'
    },
    {
      id: 30,
      date: '2025-09-12',
      type: 'enhancement',
      title: 'Theme System Implementation',
      description: 'Implemented consistent theming system with CSS variables and Tailwind configuration',
      author: 'Adnan',
      impact: 'medium'
    },

    // September 11, 2025
    {
      id: 31,
      date: '2025-09-11',
      type: 'feature',
      title: 'Multi-language Support',
      description: 'Added internationalization support for English and Hindi languages',
      author: 'Harsh',
      impact: 'medium'
    },
    {
      id: 32,
      date: '2025-09-11',
      type: 'feature',
      title: 'Language Switching',
      description: 'Implemented dynamic language switching with persistent user preferences',
      author: 'Harsh',
      impact: 'medium'
    },
    {
      id: 33,
      date: '2025-09-11',
      type: 'enhancement',
      title: 'RTL Support Preparation',
      description: 'Added foundation for right-to-left language support in future updates',
      author: 'Adnan',
      impact: 'low'
    },

    // September 10, 2025
    {
      id: 34,
      date: '2025-09-10',
      type: 'performance',
      title: 'Database Query Optimization',
      description: 'Optimized Prisma queries for better performance and reduced load times',
      author: 'Adnan',
      impact: 'medium'
    },
    {
      id: 35,
      date: '2025-09-10',
      type: 'performance',
      title: 'Database Indexing',
      description: 'Added strategic database indexes for frequently queried fields',
      author: 'Adnan',
      impact: 'medium'
    },
    {
      id: 36,
      date: '2025-09-10',
      type: 'performance',
      title: 'Query Caching Layer',
      description: 'Implemented Redis caching for frequently accessed data',
      author: 'Harsh',
      impact: 'high'
    },

    // September 9, 2025
    {
      id: 37,
      date: '2025-09-09',
      type: 'feature',
      title: 'Email Notification System (Legacy)',
      description: 'Initial implementation of basic email notifications for orders and account activities',
      author: 'Adnan',
      impact: 'medium'
    },
    {
      id: 38,
      date: '2025-09-09',
      type: 'feature',
      title: 'Basic SMTP Configuration',
      description: 'Set up basic SMTP email sending functionality for system notifications',
      author: 'Adnan',
      impact: 'low'
    },

    // September 8, 2025
    {
      id: 39,
      date: '2025-09-08',
      type: 'fix',
      title: 'Image Upload Optimization',
      description: 'Fixed image compression and added support for multiple file formats',
      author: 'Harsh',
      impact: 'low'
    },
    {
      id: 40,
      date: '2025-09-08',
      type: 'enhancement',
      title: 'File Upload Security',
      description: 'Enhanced file upload security with type validation and size limits',
      author: 'Adnan',
      impact: 'medium'
    },

    // September 7, 2025
    {
      id: 41,
      date: '2025-09-07',
      type: 'feature',
      title: 'Product Review System',
      description: 'Implemented product rating and review functionality with moderation',
      author: 'Harsh',
      impact: 'high'
    },
    {
      id: 42,
      date: '2025-09-07',
      type: 'feature',
      title: 'Review Analytics',
      description: 'Added review analytics and insights for store owners',
      author: 'Adnan',
      impact: 'medium'
    },

    // September 6, 2025
    {
      id: 43,
      date: '2025-09-06',
      type: 'feature',
      title: 'Address Management System',
      description: 'Implemented comprehensive address management for customers with multiple addresses',
      author: 'Adnan',
      impact: 'high'
    },
    {
      id: 44,
      date: '2025-09-06',
      type: 'enhancement',
      title: 'Address Validation',
      description: 'Added address validation and auto-completion features',
      author: 'Harsh',
      impact: 'medium'
    },

    // September 5, 2025
    {
      id: 45,
      date: '2025-09-05',
      type: 'feature',
      title: 'Coupon Management System',
      description: 'Added admin panel for creating and managing discount coupons',
      author: 'Adnan',
      impact: 'medium'
    },
    {
      id: 46,
      date: '2025-09-05',
      type: 'feature',
      title: 'Coupon Validation System',
      description: 'Implemented coupon validation logic with usage limits and expiry dates',
      author: 'Adnan',
      impact: 'medium'
    },

    // September 4, 2025
    {
      id: 47,
      date: '2025-09-04',
      type: 'feature',
      title: 'Inventory Management',
      description: 'Added comprehensive inventory tracking and low stock alerts',
      author: 'Harsh',
      impact: 'high'
    },
    {
      id: 48,
      date: '2025-09-04',
      type: 'enhancement',
      title: 'Stock Level Automation',
      description: 'Implemented automatic stock level updates and reorder notifications',
      author: 'Adnan',
      impact: 'medium'
    },

    // September 3, 2025 - Major Next.js Migration Complete
    {
      id: 49,
      date: '2025-09-03',
      type: 'foundation',
      title: 'Next.js Migration Complete',
      description: 'Successfully completed migration from MERN stack to Next.js 15 with App Router, achieving significant performance improvements',
      author: 'Adnan & Harsh',
      impact: 'high'
    },
    {
      id: 50,
      date: '2025-09-03',
      type: 'performance',
      title: 'PostgreSQL Migration',
      description: 'Migrated from MongoDB to PostgreSQL with Prisma ORM for better data integrity and performance',
      author: 'Adnan',
      impact: 'high'
    },
    {
      id: 51,
      date: '2025-09-03',
      type: 'enhancement',
      title: 'Server-Side Rendering',
      description: 'Implemented SSR and SSG for improved SEO and initial page load performance',
      author: 'Harsh',
      impact: 'high'
    },

    // September 2, 2025
    {
      id: 52,
      date: '2025-09-02',
      type: 'foundation',
      title: 'Database Schema Design',
      description: 'Designed comprehensive PostgreSQL schema with proper relationships and constraints',
      author: 'Adnan',
      impact: 'high'
    },
    {
      id: 53,
      date: '2025-09-02',
      type: 'enhancement',
      title: 'Data Migration Scripts',
      description: 'Created automated scripts for migrating data from MongoDB to PostgreSQL',
      author: 'Harsh',
      impact: 'medium'
    },

    // September 1, 2025 - Next.js Phase Begins
    {
      id: 54,
      date: '2025-09-01',
      type: 'foundation',
      title: 'Next.js 15 Project Setup',
      description: 'Initialized new Next.js 15 project with App Router and modern development setup',
      author: 'Adnan & Harsh',
      impact: 'high'
    },

    // August 31, 2025 - MERN Stack Final Enhancements
    {
      id: 55,
      date: '2025-08-31',
      type: 'enhancement',
      title: 'MERN Stack Performance Optimization',
      description: 'Final optimizations to MERN stack before migration including MongoDB indexing and Express.js middleware optimization',
      author: 'Adnan',
      impact: 'medium'
    },
    {
      id: 56,
      date: '2025-08-31',
      type: 'feature',
      title: 'Advanced Admin Panel',
      description: 'Completed comprehensive admin panel with user management, analytics, and system monitoring',
      author: 'Harsh',
      impact: 'high'
    },

    // August 30, 2025
    {
      id: 57,
      date: '2025-08-30',
      type: 'feature',
      title: 'Payment Integration (MERN)',
      description: 'Integrated payment gateway with Stripe and Razorpay in MERN stack version',
      author: 'Adnan',
      impact: 'high'
    },
    {
      id: 58,
      date: '2025-08-30',
      type: 'security',
      title: 'Payment Security Enhancement',
      description: 'Implemented secure payment processing with PCI compliance measures',
      author: 'Adnan',
      impact: 'high'
    },

    // August 29, 2025
    {
      id: 59,
      date: '2025-08-29',
      type: 'feature',
      title: 'Real-time Order Tracking',
      description: 'Added real-time order tracking with WebSocket integration in MERN stack',
      author: 'Harsh',
      impact: 'medium'
    },
    {
      id: 60,
      date: '2025-08-29',
      type: 'enhancement',
      title: 'WebSocket Implementation',
      description: 'Implemented WebSocket connections for real-time features and notifications',
      author: 'Harsh',
      impact: 'medium'
    },

    // August 28, 2025
    {
      id: 61,
      date: '2025-08-28',
      type: 'feature',
      title: 'Multi-vendor Marketplace',
      description: 'Implemented complete multi-vendor functionality with store management in MERN stack',
      author: 'Adnan',
      impact: 'high'
    },

    // August 27, 2025
    {
      id: 62,
      date: '2025-08-27',
      type: 'enhancement',
      title: 'MongoDB Optimization',
      description: 'Optimized MongoDB queries and implemented proper indexing for better performance',
      author: 'Adnan',
      impact: 'medium'
    },

    // August 26, 2025
    {
      id: 63,
      date: '2025-08-26',
      type: 'feature',
      title: 'User Authentication System',
      description: 'Implemented JWT-based authentication with password hashing in MERN stack',
      author: 'Harsh',
      impact: 'high'
    },

    // August 25, 2025 - MERN Stack Complete
    {
      id: 64,
      date: '2025-08-25',
      type: 'foundation',
      title: 'MERN Stack Implementation Complete',
      description: 'Successfully completed transition from vanilla stack to full MERN (MongoDB, Express.js, React, Node.js) implementation',
      author: 'Adnan & Harsh',
      impact: 'high'
    },

    // August 24, 2025
    {
      id: 65,
      date: '2025-08-24',
      type: 'enhancement',
      title: 'React Component Architecture',
      description: 'Restructured frontend with React component-based architecture and state management',
      author: 'Harsh',
      impact: 'high'
    },

    // August 23, 2025
    {
      id: 66,
      date: '2025-08-23',
      type: 'feature',
      title: 'Express.js API Development',
      description: 'Developed comprehensive REST API using Express.js with proper routing and middleware',
      author: 'Adnan',
      impact: 'high'
    },

    // August 22, 2025
    {
      id: 67,
      date: '2025-08-22',
      type: 'foundation',
      title: 'MongoDB Database Setup',
      description: 'Set up MongoDB database with proper schema design and collections for e-commerce data',
      author: 'Adnan',
      impact: 'high'
    },

    // August 21, 2025
    {
      id: 68,
      date: '2025-08-21',
      type: 'enhancement',
      title: 'Node.js Backend Architecture',
      description: 'Established Node.js backend architecture with modular design and proper error handling',
      author: 'Harsh',
      impact: 'medium'
    },

    // August 20, 2025 - MERN Transition Begins
    {
      id: 69,
      date: '2025-08-20',
      type: 'foundation',
      title: 'MERN Stack Migration Started',
      description: 'Initiated migration from vanilla HTML/CSS/JS to MERN stack for enhanced functionality and scalability',
      author: 'Adnan & Harsh',
      impact: 'high'
    },

    // August 19, 2025 - Full Stack Phase Final
    {
      id: 70,
      date: '2025-08-19',
      type: 'enhancement',
      title: 'Vanilla JS Optimization',
      description: 'Final optimizations to vanilla JavaScript including code organization and performance improvements',
      author: 'Harsh',
      impact: 'medium'
    },

    // August 18, 2025
    {
      id: 71,
      date: '2025-08-18',
      type: 'feature',
      title: 'Shopping Cart Functionality',
      description: 'Implemented shopping cart with local storage persistence using vanilla JavaScript',
      author: 'Adnan',
      impact: 'high'
    },

    // August 17, 2025
    {
      id: 72,
      date: '2025-08-17',
      type: 'enhancement',
      title: 'CSS Grid & Flexbox Layout',
      description: 'Enhanced layout system using CSS Grid and Flexbox for responsive design',
      author: 'Harsh',
      impact: 'medium'
    },

    // August 16, 2025
    {
      id: 73,
      date: '2025-08-16',
      type: 'feature',
      title: 'Product Catalog Display',
      description: 'Created dynamic product catalog with filtering and sorting using vanilla JavaScript',
      author: 'Adnan',
      impact: 'high'
    },

    // August 15, 2025
    {
      id: 74,
      date: '2025-08-15',
      type: 'enhancement',
      title: 'Responsive Design Implementation',
      description: 'Implemented responsive design principles for mobile-first approach',
      author: 'Harsh',
      impact: 'medium'
    },

    // August 14, 2025
    {
      id: 75,
      date: '2025-08-14',
      type: 'feature',
      title: 'Basic Navigation System',
      description: 'Created navigation system and page routing using vanilla JavaScript',
      author: 'Adnan',
      impact: 'medium'
    },

    // August 13, 2025
    {
      id: 76,
      date: '2025-08-13',
      type: 'enhancement',
      title: 'CSS Styling Framework',
      description: 'Established custom CSS framework with consistent styling and variables',
      author: 'Harsh',
      impact: 'low'
    },

    // August 12, 2025 - Initial Development Phase
    {
      id: 77,
      date: '2025-08-12',
      type: 'foundation',
      title: 'Project Initialization & Planning',
      description: 'Initial project setup with HTML, CSS, and JavaScript foundation. Project planning and wireframe creation completed.',
      author: 'Adnan & Harsh',
      impact: 'high'
    }
  ]

  const getTypeColor = (type) => {
    switch (type) {
      case 'feature': return 'bg-green-100 text-green-800'
      case 'enhancement': return 'bg-blue-100 text-blue-800'
      case 'fix': return 'bg-yellow-100 text-yellow-800'
      case 'security': return 'bg-red-100 text-red-800'
      case 'performance': return 'bg-purple-100 text-purple-800'
      case 'foundation': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="prose prose-gray max-w-none">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Recent Changes</h1>
        <p className="text-xl text-gray-600">
          Track the latest updates, features, and improvements to the BharatVerse platform
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {recentChanges.filter(c => c.type === 'feature').length}
          </div>
          <div className="text-sm text-green-700">New Features</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {recentChanges.filter(c => c.type === 'enhancement').length}
          </div>
          <div className="text-sm text-blue-700">Enhancements</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {recentChanges.filter(c => c.type === 'fix').length}
          </div>
          <div className="text-sm text-yellow-700">Bug Fixes</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            {recentChanges.filter(c => c.impact === 'high').length}
          </div>
          <div className="text-sm text-purple-700">High Impact</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {recentChanges.map((change, index) => (
          <div key={change.id} className="relative">
            {/* Timeline line */}
            {index !== recentChanges.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
            )}
            
            <div className="flex items-start gap-4">
              {/* Timeline dot */}
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-full border-4 border-white shadow-md flex items-center justify-center ${
                  change.type === 'feature' ? 'bg-green-500' :
                  change.type === 'enhancement' ? 'bg-blue-500' :
                  change.type === 'fix' ? 'bg-yellow-500' :
                  change.type === 'security' ? 'bg-red-500' :
                  change.type === 'performance' ? 'bg-purple-500' :
                  'bg-gray-500'
                }`}>
                  {change.type === 'feature' && <Zap className="text-white" size={16} />}
                  {change.type === 'enhancement' && <Package className="text-white" size={16} />}
                  {change.type === 'fix' && <X className="text-white" size={16} />}
                  {change.type === 'security' && <Shield className="text-white" size={16} />}
                  {change.type === 'performance' && <Activity className="text-white" size={16} />}
                  {change.type === 'foundation' && <Code className="text-white" size={16} />}
                </div>
              </div>

              {/* Change content */}
              <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{change.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(change.type)}`}>
                      {change.type}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getImpactColor(change.impact)}`}></div>
                      <span className="text-xs text-gray-500 capitalize">{change.impact} impact</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(change.date)}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3">{change.description}</p>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User size={14} />
                  <span>by {change.author}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Development Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Development Insights</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">39</div>
            <div className="text-sm text-gray-600">Days in Development</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">77</div>
            <div className="text-sm text-gray-600">Major Updates</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600 mb-2">2</div>
            <div className="text-sm text-gray-600">Active Developers</div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-white rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Development Philosophy</h3>
          <p className="text-gray-700 text-sm">
            Our development approach focuses on rapid iteration, user feedback integration, and maintaining 
            high code quality standards. Each update undergoes thorough testing and code review processes 
            to ensure platform stability and security.
          </p>
        </div>
      </div>

      {/* Upcoming Changes */}
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h2 className="text-xl font-semibold text-yellow-800 mb-4">What's Coming Next?</h2>
        <ul className="space-y-2 text-yellow-700">
          <li>• AI-powered product recommendations</li>
          <li>• Advanced analytics dashboard</li>
          <li>• Mobile app development</li>
          <li>• Payment gateway integration</li>
          <li>• Multi-currency support</li>
        </ul>
        <p className="text-yellow-600 mt-4 text-sm">
          Stay tuned for more exciting updates as we continue to enhance the BharatVerse platform!
        </p>
      </div>
    </div>
  )
}

export default DocsPage
