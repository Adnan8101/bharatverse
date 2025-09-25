'use client';

import { Mail, Phone, MapPin, Github, Code, Database, Zap, Shield, Activity, Users, Calendar, Trophy } from 'lucide-react';
import Link from 'next/link';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-emerald-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">About BharatVerse</h1>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed">
              Your ultimate destination for the latest and smartest gadgets. From smartphones and smartwatches 
              to essential accessories, we bring you the best in innovation — all in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                BharatVerse was born from a vision to revolutionize the e-commerce experience. We believe in bringing 
                cutting-edge technology to everyone, making it accessible, affordable, and user-friendly.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                What started as a simple idea has evolved into a comprehensive multi-vendor platform that empowers 
                both customers and store owners to achieve their goals in the digital marketplace.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/create-store" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
                  Start Your Store
                </Link>
                <Link href="/docs" className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-3xl font-bold text-green-600 mb-2">1000+</div>
                <div className="text-gray-600">Products Available</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                <div className="text-gray-600">Active Stores</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-3xl font-bold text-orange-600 mb-2">99.9%</div>
                <div className="text-gray-600">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built with Modern Technology</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              BharatVerse is powered by cutting-edge technologies to ensure the best performance, security, and user experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <Code className="text-blue-600 mx-auto mb-4" size={48} />
              <h3 className="font-semibold text-gray-900 mb-2">Next.js 15</h3>
              <p className="text-gray-600 text-sm">React framework with App Router for optimal performance</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <Database className="text-green-600 mx-auto mb-4" size={48} />
              <h3 className="font-semibold text-gray-900 mb-2">PostgreSQL</h3>
              <p className="text-gray-600 text-sm">Robust database with Prisma ORM for type safety</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <Shield className="text-red-600 mx-auto mb-4" size={48} />
              <h3 className="font-semibold text-gray-900 mb-2">Secure Authentication</h3>
              <p className="text-gray-600 text-sm">Multiple auth layers with Clerk and JWT</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <Zap className="text-yellow-600 mx-auto mb-4" size={48} />
              <h3 className="font-semibold text-gray-900 mb-2">High Performance</h3>
              <p className="text-gray-600 text-sm">Optimized for speed and scalability</p>
            </div>
          </div>
        </div>
      </section>

      {/* Development Journey */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Development Journey</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              39 days of intensive development, 77 major updates, and 3 technology stack transitions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <Calendar className="text-red-600 mb-4" size={40} />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Phase 1: Foundation</h3>
              <p className="text-gray-600 mb-3">August 12-19, 2025</p>
              <p className="text-gray-700">
                Started with vanilla HTML, CSS, and JavaScript to establish core functionality and UI concepts.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <Activity className="text-blue-600 mb-4" size={40} />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Phase 2: MERN Stack</h3>
              <p className="text-gray-600 mb-3">August 20-31, 2025</p>
              <p className="text-gray-700">
                Transitioned to MERN stack (MongoDB, Express.js, React, Node.js) for dynamic functionality.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <Trophy className="text-green-600 mb-4" size={40} />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Phase 3: Next.js</h3>
              <p className="text-gray-600 mb-3">September 1-20, 2025</p>
              <p className="text-gray-700">
                Complete rebuild with Next.js, PostgreSQL, and modern technologies for production-ready performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The passionate developers behind BharatVerse's innovation and success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Adnan Qureshi</h3>
              <p className="text-green-600 font-medium mb-3">Lead Developer & Co-Founder</p>
              <p className="text-gray-600 text-sm">
                Full-stack developer specializing in Next.js, database architecture, and system design. 
                Passionate about creating scalable e-commerce solutions.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Harsh</h3>
              <p className="text-blue-600 font-medium mb-3">Frontend Developer & Co-Founder</p>
              <p className="text-gray-600 text-sm">
                UI/UX specialist focused on creating beautiful, responsive user interfaces and 
                optimizing user experience across all devices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose BharatVerse?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've built BharatVerse with features that matter most to both customers and store owners.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <Shield className="text-green-600 mb-4" size={32} />
              <h3 className="font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
              <p className="text-gray-600 text-sm">
                Advanced security measures including OAuth2 integration, JWT authentication, and encrypted data storage.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <Zap className="text-yellow-600 mb-4" size={32} />
              <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600 text-sm">
                Optimized performance with Next.js, server-side rendering, and efficient database queries.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <Users className="text-blue-600 mb-4" size={32} />
              <h3 className="font-semibold text-gray-900 mb-2">Multi-Vendor</h3>
              <p className="text-gray-600 text-sm">
                Complete marketplace solution supporting multiple vendors with individual store management.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <Mail className="text-purple-600 mb-4" size={32} />
              <h3 className="font-semibold text-gray-900 mb-2">Email Notifications</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive email system with professional templates for order updates and communications.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <Activity className="text-red-600 mb-4" size={32} />
              <h3 className="font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
              <p className="text-gray-600 text-sm">
                Advanced analytics dashboard for store owners with sales tracking and performance insights.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <Code className="text-indigo-600 mb-4" size={32} />
              <h3 className="font-semibold text-gray-900 mb-2">Modern Architecture</h3>
              <p className="text-gray-600 text-sm">
                Built with the latest technologies ensuring scalability, maintainability, and future-proof design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-green-600 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of customers and store owners who trust BharatVerse for their e-commerce needs.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/" className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Start Shopping
            </Link>
            <Link href="/create-store" className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition">
              Create Your Store
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
