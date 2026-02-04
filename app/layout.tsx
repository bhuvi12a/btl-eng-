import type { Metadata } from 'next';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';

export const metadata: Metadata = {
    title: 'BTL Engineering | Precision Engineering Excellence',
    description:
        'BTL Engineering is an ISO 9001:2015 certified precision engineering company supplying OEM and Aerospace customers with strong design, development, and manufacturing capabilities based in Hosur, India.',
    keywords: [
        'BTL Engineering',
        'precision engineering',
        'OEM supplier',
        'aerospace components',
        'automotive components',
        'industrial manufacturing',
        'ISO 9001:2015',
        'Hosur India',
        'precision machining',
        'design engineering',
    ],
    authors: [{ name: 'BTL Engineering' }],
    openGraph: {
        title: 'BTL Engineering | Precision Engineering Excellence',
        description:
            'ISO 9001:2015 certified precision engineering company serving OEM and Aerospace customers.',
        type: 'website',
        locale: 'en_IN',
        siteName: 'BTL Engineering',
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
                <Header />
                {children}
                <Footer />
            </body>
        </html>
    );
}
