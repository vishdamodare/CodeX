import Navbar from "@/components/Navbar";

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Navbar />
            <div className="main-content">
                {children}
            </div>
        </>
    );
}
