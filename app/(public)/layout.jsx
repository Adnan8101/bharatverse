'use client'
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTranslationWrapper from "@/components/PageTranslationWrapper";

export default function PublicLayout({ children }) {

    return (
        <>
            <Banner />
            <Navbar />
            <PageTranslationWrapper>
                {children}
            </PageTranslationWrapper>
            <Footer />
        </>
    );
}
