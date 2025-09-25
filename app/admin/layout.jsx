import AdminLayout from "@/components/admin/AdminLayout";
import AdminProtection from "@/components/admin/AdminProtection";
import PageTranslationWrapper from "@/components/PageTranslationWrapper";

export const metadata = {
    title: "BharatVerse. - Admin",
    description: "BharatVerse. - Admin",
};

export default function RootAdminLayout({ children }) {

    return (
        <AdminProtection>
            <AdminLayout>
                <PageTranslationWrapper>
                    {children}
                </PageTranslationWrapper>
            </AdminLayout>
        </AdminProtection>
    );
}
