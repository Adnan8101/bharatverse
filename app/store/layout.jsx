import StoreLayout from "@/components/store/StoreLayoutClean";

export const metadata = {
    title: "BharatVerse. - Store Dashboard",
    description: "BharatVerse. - Store Dashboard",
};

export default function RootAdminLayout({ children }) {
    return (
        <StoreLayout>
            {children}
        </StoreLayout>
    );
}
