'use client'
import { useLanguage } from '@/contexts/LanguageContext'
import useTranslation from '@/hooks/useTranslation'
import { languages } from '@/lib/languages'

const LanguageDemo = () => {
    const { currentLanguage, currentLanguageInfo, changeLanguage } = useLanguage()
    const { t, formatCurrency, formatDate, formatNumber } = useTranslation()

    const demoDate = new Date()
    const demoPrice = 1299.99
    const demoQuantity = 12345

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    {t('common.demo', 'Language System Demo')}
                </h1>
                <p className="text-gray-600">
                    Current Language: <span className="font-semibold">{currentLanguageInfo?.nativeName}</span> ({currentLanguage})
                </p>
            </div>

            {/* Quick Language Switcher */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Quick Language Switch</h2>
                <div className="flex flex-wrap gap-2">
                    {languages.slice(0, 6).map((language) => (
                        <button
                            key={language.code}
                            onClick={() => changeLanguage(language.code)}
                            className={`px-4 py-2 rounded-lg border transition-all ${
                                currentLanguage === language.code
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                            }`}
                        >
                            {language.flag} {language.nativeName}
                        </button>
                    ))}
                </div>
            </div>

            {/* Demo Translations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Navigation Translations</h3>
                    <ul className="space-y-2">
                        <li><span className="font-medium">{t('nav.home', 'Home')}</span></li>
                        <li><span className="font-medium">{t('nav.shop', 'Shop')}</span></li>
                        <li><span className="font-medium">{t('nav.cart', 'Cart')}</span></li>
                        <li><span className="font-medium">{t('nav.orders', 'Orders')}</span></li>
                        <li><span className="font-medium">{t('nav.about', 'About')}</span></li>
                        <li><span className="font-medium">{t('nav.contact', 'Contact')}</span></li>
                    </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Shopping Translations</h3>
                    <ul className="space-y-2">
                        <li><span className="font-medium">{t('shop.addToCart', 'Add to Cart')}</span></li>
                        <li><span className="font-medium">{t('shop.buyNow', 'Buy Now')}</span></li>
                        <li><span className="font-medium">{t('shop.outOfStock', 'Out of Stock')}</span></li>
                        <li><span className="font-medium">{t('shop.inStock', 'In Stock')}</span></li>
                        <li><span className="font-medium">{t('shop.category', 'Category')}</span></li>
                        <li><span className="font-medium">{t('shop.rating', 'Rating')}</span></li>
                    </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Order Translations</h3>
                    <ul className="space-y-2">
                        <li><span className="font-medium">{t('orders.myOrders', 'My Orders')}</span></li>
                        <li><span className="font-medium">{t('orders.orderSummary', 'Order Summary')}</span></li>
                        <li><span className="font-medium">{t('orders.deliveryAddress', 'Delivery Address')}</span></li>
                        <li><span className="font-medium">{t('orders.itemsOrdered', 'Items Ordered')}</span></li>
                        <li><span className="font-medium">{t('orders.orderPlaced', 'Order Placed')}</span></li>
                        <li><span className="font-medium">{t('orders.delivered', 'Delivered')}</span></li>
                    </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Payment Translations</h3>
                    <ul className="space-y-2">
                        <li><span className="font-medium">{t('payment.cashOnDelivery', 'Cash on Delivery')}</span></li>
                        <li><span className="font-medium">{t('payment.cardPayment', 'Card Payment')}</span></li>
                        <li><span className="font-medium">{t('payment.razorpay', 'Razorpay (UPI/Cards/Wallets)')}</span></li>
                        <li><span className="font-medium">{t('payment.payNow', 'Pay Now')}</span></li>
                        <li><span className="font-medium">{t('payment.paymentSuccessful', 'Payment Successful')}</span></li>
                        <li><span className="font-medium">{t('payment.paymentFailed', 'Payment Failed')}</span></li>
                    </ul>
                </div>
            </div>

            {/* Formatting Demo */}
            <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Formatting Examples</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Currency Formatting</p>
                        <p className="text-xl font-semibold">{formatCurrency(demoPrice)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Number Formatting</p>
                        <p className="text-xl font-semibold">{formatNumber(demoQuantity)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Date Formatting</p>
                        <p className="text-xl font-semibold">{formatDate(demoDate)}</p>
                    </div>
                </div>
            </div>

            {/* Language Info */}
            <div className="mt-8 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold mb-2">Current Language Info</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Code:</span>
                        <span className="ml-2 font-medium">{currentLanguageInfo?.code}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Name:</span>
                        <span className="ml-2 font-medium">{currentLanguageInfo?.name}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Native:</span>
                        <span className="ml-2 font-medium">{currentLanguageInfo?.nativeName}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Direction:</span>
                        <span className="ml-2 font-medium">{currentLanguageInfo?.direction}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LanguageDemo
