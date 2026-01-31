import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/sonner';
import './globals.scss';

export const metadata: Metadata = {
	title: 'TaskFlow',
	description: 'Task management application',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<html lang="en" className="dark">
				<body className="antialiased bg-background text-foreground">
					{children}
					<Toaster />
				</body>
			</html>
		</ClerkProvider>
	);
}

