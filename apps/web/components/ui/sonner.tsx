'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
	return (
		<Sonner
			theme="dark"
			className="toaster group"
			style={
				{
					'--normal-bg': 'hsl(var(--popover))',
					'--normal-text': 'hsl(var(--popover-foreground))',
					'--normal-border': 'hsl(var(--border))',
					'--success-bg': 'hsl(var(--success))',
					'--success-text': 'hsl(var(--success-foreground))',
					'--success-border': 'hsl(var(--success))',
					'--error-bg': 'hsl(var(--destructive))',
					'--error-text': 'hsl(var(--destructive-foreground))',
					'--error-border': 'hsl(var(--destructive))',
				} as React.CSSProperties
			}
			toastOptions={{
				classNames: {
					toast:
						'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
					description: 'group-[.toast]:text-muted-foreground',
					actionButton:
						'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
					cancelButton:
						'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
