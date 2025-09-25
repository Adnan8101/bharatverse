import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from '@clerk/nextjs';
import StoreProvider from "@/app/StoreProvider";
import { DynamicLanguageProvider } from "@/contexts/DynamicLanguageContext";
import TranslationModal from "@/components/TranslationModal";
import CartRestoredNotification from "@/components/CartRestoredNotification";
import GuestCartSavedNotification from "@/components/GuestCartSavedNotification";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
    title: "BharatVerse. - Shop smarter",
    description: "BharatVerse. - Shop smarter",
};

export default function RootLayout({ children }) {
    return (
        <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl="/"
            afterSignUpUrl="/"
        >
            <html lang="en">
                <body className={`${outfit.className} antialiased`} suppressHydrationWarning={true}>
                    <DynamicLanguageProvider>
                        <StoreProvider>
                            <Toaster />
                            <TranslationModal />
                            <CartRestoredNotification />
                            <GuestCartSavedNotification />
                            {children}
                        </StoreProvider>
                    </DynamicLanguageProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
