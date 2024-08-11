import { ThemeProvider } from 'next-themes';
import type { ComponentProps, PropsWithChildren } from 'react';
import { Footer } from '../footer/footer';

type Props = PropsWithChildren<{
	themeProps?: Partial<ComponentProps<typeof ThemeProvider>>;
}>;

export function FooterWrapper({ children, themeProps }: Props) {
	return (
		<ThemeProvider
			attribute='class'
			defaultTheme='system'
			enableSystem={true}
			disableTransitionOnChange={true}
			{...themeProps}
		>
			<div className='min-h-screen flex flex-col'>
				<div className='flex-1 w-full flex flex-col'>{children}</div>
				<Footer />
			</div>
		</ThemeProvider>
	);
}
