'use client'
import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { defaultLanguage, getLanguageByCode } from '@/lib/languages'

const DynamicLanguageContext = createContext()

export const useDynamicLanguage = () => {
    const context = useContext(DynamicLanguageContext)
    if (!context) {
        throw new Error('useDynamicLanguage must be used within a DynamicLanguageProvider')
    }
    return context
}

export const DynamicLanguageProvider = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = useState(defaultLanguage)
    const [isTranslating, setIsTranslating] = useState(false)
    const [translationCache, setTranslationCache] = useState({})
    const [backgroundTranslations, setBackgroundTranslations] = useState(new Set())
    const [isTranslationAborted, setIsTranslationAborted] = useState(false)
    const [showTranslationModal, setShowTranslationModal] = useState(false)
    
    // Refs for performance optimization
    const translationQueue = useRef([])
    const isProcessingQueue = useRef(false)
    const observer = useRef(null)
    const abortController = useRef(null)
    const requestCount = useRef(0)
    const lastRequestTime = useRef(0)

    // Rate limiting function
    const canMakeRequest = () => {
        const now = Date.now()
        const timeSinceLastRequest = now - lastRequestTime.current
        
        // Reset counter if more than 1 minute has passed
        if (timeSinceLastRequest > 60000) {
            requestCount.current = 0
        }
        
        // Limit to 10 requests per minute to stay well below the 15 limit
        if (requestCount.current >= 10) {
            console.warn('Translation rate limit reached. Please wait before translating more content.')
            return false
        }
        
        return true
    }

    // Function to abort translation
    const abortTranslation = () => {
        setIsTranslationAborted(true)
        setIsTranslating(false)
        setShowTranslationModal(false)
        if (abortController.current) {
            abortController.current.abort()
        }
    }

    // Load saved language from localStorage on mount
    useEffect(() => {
        const savedLanguage = localStorage.getItem('bharatverse-language')
        if (savedLanguage && savedLanguage !== defaultLanguage) {
            setCurrentLanguage(savedLanguage)
            // Don't auto-translate on load, let user trigger it
        }
    }, [])

    // Initialize mutation observer for dynamic content (disabled for now to prevent auto-translation)
    useEffect(() => {
        // Temporarily disable mutation observer to prevent automatic translations
        // that cause rate limiting issues
        return () => {
            if (observer.current) {
                observer.current.disconnect()
            }
        }
    }, [currentLanguage])

    // Function to extract text content from element
    const extractTextContent = (element) => {
        const textNodes = []
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    // Skip script, style, and other non-visible elements
                    const parent = node.parentElement
                    if (!parent) return NodeFilter.FILTER_REJECT
                    
                    const tagName = parent.tagName.toLowerCase()
                    if (['script', 'style', 'noscript', 'meta', 'link', 'title'].includes(tagName)) {
                        return NodeFilter.FILTER_REJECT
                    }
                    
                    // Skip if parent has display: none or visibility: hidden
                    const computedStyle = window.getComputedStyle(parent)
                    if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
                        return NodeFilter.FILTER_REJECT
                    }
                    
                    // Skip empty or whitespace-only text
                    const text = node.textContent.trim()
                    if (!text || text.length < 2) {
                        return NodeFilter.FILTER_REJECT
                    }
                    
                    // Skip text that looks like numbers only (prices, dates, etc might need special handling)
                    // We'll be more selective here to avoid translating things like product IDs
                    if (/^\d+(\.\d+)?$/.test(text) || /^[\d\s\-\+\(\)\.]+$/.test(text)) {
                        return NodeFilter.FILTER_REJECT
                    }
                    
                    return NodeFilter.FILTER_ACCEPT
                }
            }
        )

        let node
        while (node = walker.nextNode()) {
            textNodes.push({
                node,
                originalText: node.textContent,
                element: node.parentElement
            })
        }

        return textNodes
    }

    // Function to translate a single element
    const translateElement = async (element, targetLanguage, isBackground = false) => {
        if (targetLanguage === defaultLanguage || isTranslationAborted) return

        // Check rate limit
        if (!canMakeRequest()) {
            console.warn('Translation rate limit reached. Skipping translation.')
            return
        }

        try {
            const textNodes = extractTextContent(element)
            if (textNodes.length === 0) return

            // Create a batch of text to translate
            const textBatch = textNodes.map(item => item.originalText).join('\n---TEXT_SEPARATOR---\n')
            
            // Check cache first
            const cacheKey = `${textBatch}_${targetLanguage}`
            if (translationCache[cacheKey]) {
                applyTranslations(textNodes, translationCache[cacheKey])
                return
            }

            // Skip if the text batch is too small to be meaningful
            if (textBatch.trim().length < 3) return

            if (!isBackground) {
                setIsTranslating(true)
            }

            // Create abort controller for this request
            abortController.current = new AbortController()
            
            // Update request tracking
            requestCount.current += 1
            lastRequestTime.current = Date.now()

            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: textBatch,
                    targetLanguage,
                    sourceLanguage: defaultLanguage
                }),
                signal: abortController.current.signal
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success && data.translatedContent) {
                    const translations = data.translatedContent.split('\n---TEXT_SEPARATOR---\n')
                    
                    // Cache the translation
                    setTranslationCache(prev => ({
                        ...prev,
                        [cacheKey]: translations
                    }))

                    applyTranslations(textNodes, translations)
                }
            } else if (response.status === 429) {
                console.warn('Rate limit exceeded. Please wait before translating more content.')
                // Reset request count to allow retry later
                requestCount.current = 10
            } else {
                console.warn('Translation API returned error:', response.status)
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Translation aborted by user')
            } else {
                console.error('Translation error:', error)
            }
        } finally {
            if (!isBackground) {
                setIsTranslating(false)
            }
        }
    }

    // Function to apply translations to text nodes
    const applyTranslations = (textNodes, translations) => {
        textNodes.forEach((item, index) => {
            if (translations[index] && item.node.parentElement) {
                // Preserve the original text as a data attribute for reverting
                if (!item.node.parentElement.hasAttribute('data-original-text')) {
                    item.node.parentElement.setAttribute('data-original-text', item.originalText)
                }
                item.node.textContent = translations[index].trim()
            }
        })
    }

    // Function to revert translations
    const revertTranslations = () => {
        const elementsWithOriginalText = document.querySelectorAll('[data-original-text]')
        elementsWithOriginalText.forEach(element => {
            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                null,
                false
            )

            let textNode
            while (textNode = walker.nextNode()) {
                if (textNode.parentElement === element) {
                    textNode.textContent = element.getAttribute('data-original-text')
                    element.removeAttribute('data-original-text')
                    break
                }
            }
        })
    }

    // Function to translate page in controlled chunks
    const translatePageInChunks = async (targetLanguage) => {
        if (targetLanguage === defaultLanguage || isTranslationAborted) {
            revertTranslations()
            return
        }

        // Get all text elements, but translate them one by one with delays
        const contentSelectors = [
            'nav',
            'header', 
            'main',
            'article',
            'section',
            'footer'
        ]

        for (const selector of contentSelectors) {
            if (isTranslationAborted) break
            
            const elements = document.querySelectorAll(selector)
            for (const element of elements) {
                if (isTranslationAborted) break
                
                await translateElement(element, targetLanguage)
                // Add delay between translations to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        }
    }

    // Function to translate entire page (legacy - now controlled)
    const translatePage = async (targetLanguage) => {
        // This function is now just a wrapper
        await translatePageInChunks(targetLanguage)
    }

    // Background translation disabled to prevent rate limiting
    const startBackgroundTranslation = async (targetLanguage) => {
        // Disabled to prevent too many API calls
        console.log('Background translation disabled to prevent rate limiting')
    }

    // Main language change function
    const changeLanguage = async (languageCode) => {
        if (languageCode === currentLanguage) return

        // Reset abort state
        setIsTranslationAborted(false)
        
        setCurrentLanguage(languageCode)
        localStorage.setItem('bharatverse-language', languageCode)
        
        // Update document language and direction
        const language = getLanguageByCode(languageCode)
        document.documentElement.lang = languageCode
        document.documentElement.dir = language.direction

        // If changing back to default language, revert translations
        if (languageCode === defaultLanguage) {
            revertTranslations()
            return
        }

        // Show confirmation modal for translation
        setShowTranslationModal(true)
    }

    // Function to start translation (called when user confirms)
    const startTranslation = async () => {
        setShowTranslationModal(false)
        setIsTranslating(true)
        
        try {
            // Translate current page in smaller chunks to avoid rate limits
            await translatePageInChunks(currentLanguage)
        } finally {
            setIsTranslating(false)
        }
    }

    // Hook for components to trigger translation of specific elements
    const translateComponent = async (elementRef, targetLanguage = currentLanguage) => {
        if (elementRef.current && targetLanguage !== defaultLanguage) {
            await translateElement(elementRef.current, targetLanguage)
        }
    }

    // Function to force retranslation (useful for page navigation)
    const retranslateCurrentPage = async () => {
        if (currentLanguage !== defaultLanguage) {
            await translatePage(currentLanguage)
            await startBackgroundTranslation(currentLanguage)
        }
    }

    const value = {
        currentLanguage,
        isTranslating,
        changeLanguage,
        startTranslation,
        abortTranslation,
        translateComponent,
        retranslateCurrentPage,
        showTranslationModal,
        isTranslationAborted,
        currentLanguageInfo: getLanguageByCode(currentLanguage),
        translationCache: Object.keys(translationCache).length
    }

    return (
        <DynamicLanguageContext.Provider value={value}>
            {children}
        </DynamicLanguageContext.Provider>
    )
}
