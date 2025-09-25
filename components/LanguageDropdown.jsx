'use client'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Globe, Check } from 'lucide-react'
import { languages } from '@/lib/languages'
import { useLanguage } from '@/contexts/LanguageContext'

const LanguageDropdown = ({ variant = 'default' }) => {
    const { currentLanguage, changeLanguage, isLoading, currentLanguageInfo } = useLanguage()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleLanguageChange = async (languageCode) => {
        if (languageCode !== currentLanguage) {
            await changeLanguage(languageCode)
        }
        setIsOpen(false)
    }

    // Different styles based on variant
    const getVariantStyles = () => {
        switch (variant) {
            case 'admin':
                return {
                    button: 'flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors',
                    dropdown: 'absolute right-0 mt-2 w-56 bg-white border border-purple-200 rounded-xl shadow-lg z-50',
                    item: 'flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-purple-50 transition-colors'
                }
            case 'store':
                return {
                    button: 'flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors',
                    dropdown: 'absolute right-0 mt-2 w-56 bg-white border border-green-200 rounded-xl shadow-lg z-50',
                    item: 'flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-green-50 transition-colors'
                }
            default:
                return {
                    button: 'flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors',
                    dropdown: 'absolute right-0 mt-2 w-56 bg-white border border-blue-200 rounded-xl shadow-lg z-50',
                    item: 'flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 transition-colors'
                }
        }
    }

    const styles = getVariantStyles()

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={styles.button}
                disabled={isLoading}
            >
                <Globe size={16} />
                <span className="hidden sm:inline">{currentLanguageInfo?.nativeName}</span>
                <span className="sm:hidden">{currentLanguageInfo?.flag}</span>
                <ChevronDown 
                    size={14} 
                    className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className="py-2 max-h-80 overflow-y-auto">
                        <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                            Select Language
                        </div>
                        {languages.map((language) => (
                            <button
                                key={language.code}
                                onClick={() => handleLanguageChange(language.code)}
                                className={`w-full ${styles.item} ${
                                    currentLanguage === language.code 
                                        ? 'bg-blue-50 text-blue-700' 
                                        : ''
                                }`}
                                disabled={isLoading}
                            >
                                <span className="text-lg">{language.flag}</span>
                                <div className="flex-1 text-left">
                                    <div className="font-medium">{language.nativeName}</div>
                                    <div className="text-xs text-slate-500">{language.name}</div>
                                </div>
                                {currentLanguage === language.code && (
                                    <Check size={16} className="text-blue-600" />
                                )}
                            </button>
                        ))}
                    </div>
                    
                    {isLoading && (
                        <div className="px-4 py-3 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                Loading translations...
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default LanguageDropdown
