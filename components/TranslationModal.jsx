'use client'
import { X, Globe, Loader2 } from 'lucide-react'
import { useDynamicLanguage } from '@/contexts/DynamicLanguageContext'

export default function TranslationModal() {
    const { 
        showTranslationModal, 
        startTranslation, 
        abortTranslation, 
        isTranslating,
        currentLanguageInfo
    } = useDynamicLanguage()

    if (!showTranslationModal && !isTranslating) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Globe className="w-6 h-6" />
                            <h2 className="text-xl font-bold">Translation</h2>
                        </div>
                        <button
                            onClick={abortTranslation}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isTranslating ? (
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-4">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                Translating Page...
                            </h3>
                            <p className="text-slate-600 mb-6">
                                Translating content to {currentLanguageInfo?.name}. This may take a moment.
                            </p>
                            <button
                                onClick={abortTranslation}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                            >
                                Cancel Translation
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Globe className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                Translate to {currentLanguageInfo?.name}?
                            </h3>
                            <p className="text-slate-600 mb-6">
                                This will translate the current page content. The translation process may take a few moments.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={abortTranslation}
                                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={startTranslation}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                                >
                                    Translate
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
