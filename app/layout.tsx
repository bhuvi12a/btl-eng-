import type { Metadata } from 'next';
import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export const metadata: Metadata = {
    metadataBase: new URL('https://www.btlengg.com'),
    title: 'BTL | Automotive & Aerospace Precision Components | Hosur, Tamil Nadu',
    description:
        'Established in 2024 in Hosur, Tamil Nadu, BTL manufactures precision automotive and aerospace components in Steel, Aluminium, and Stainless Steel (SS) with CNC, VMC, drilling, in-house tool room, and complete inspection.',
    keywords: [
        'BTL',
        'BTL Hosur',
        'precision engineering',
        'automotive components',
        'aerospace components',
        'CNC Machines',
        'VMC Milling Machines',
        'Drilling Machines',
        'In-house Tool Room',
        'Complete Component Inspection',
        'Engineering Design',
        'Steel Aluminium Stainless Steel',
        'Hosur Tamil Nadu India',
    ],
    authors: [{ name: 'BTL' }],
    openGraph: {
        title: 'BTL | Automotive & Aerospace Precision Components',
        description:
            'Established in 2024 in Hosur, Tamil Nadu. Manufacturing precision automotive and aerospace components.',
        type: 'website',
        locale: 'en_IN',
        siteName: 'BTL',
    },
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: 'any' },
            { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
            { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
        ],
        apple: [
            { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        ],
    },
    robots: {
        index: true,
        follow: true,
    },
};

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <meta name="theme-color" content="#ffffff" />
            </head>
            <body className="antialiased font-sans">
                <Navbar />
                {children}
                <Footer />
            </body>
        </html>
    );
}
