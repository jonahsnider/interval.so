/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
	prefix: '',
	theme: {
		fontFamily: {
			serif: ['var(--font-playfair-display)'],
			sans: ['var(--font-inter)'],
		},
		container: {
			center: true,
			padding: '1rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: {
					// biome-ignore lint/style/useNamingConvention: This can't be renamed
					DEFAULT: 'hsl(var(--input))',
					border: 'hsl(var(--input-border))',
				},
				ring: 'hsl(var(--ring))',
				background: {
					// biome-ignore lint/style/useNamingConvention: This can't be renamed
					DEFAULT: 'hsl(var(--background))',
					muted: 'hsl(var(--background-muted))',
				},
				foreground: 'hsl(var(--foreground))',
				primary: {
					// biome-ignore lint/style/useNamingConvention: This can't be renamed
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))',
				},
				secondary: {
					// biome-ignore lint/style/useNamingConvention: This can't be renamed
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					hover: 'hsl(var(--secondary-hover))',
				},
				destructive: {
					// biome-ignore lint/style/useNamingConvention: This can't be renamed
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
					muted: 'hsl(var(--destructive-muted))',
					hover: 'hsl(var(--destructive-hover))',
				},
				muted: {
					// biome-ignore lint/style/useNamingConvention: This can't be renamed
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					// biome-ignore lint/style/useNamingConvention: This can't be renamed
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				popover: {
					// biome-ignore lint/style/useNamingConvention: This can't be renamed
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					// biome-ignore lint/style/useNamingConvention: This can't be renamed
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				'menu-item': {
					// biome-ignore lint/style/useNamingConvention: This can't be renamed
					DEFAULT: 'hsl(var(--menu-item))',
					selected: 'hsl(var(--menu-item-selected))',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
			screens: {
				xs: '520px',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
};
