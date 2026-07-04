/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      "colors": {
              "surface-container": "#201f1f",
              "on-surface": "#e5e2e1",
              "surface-variant": "#353534",
              "primary-fixed-dim": "#eec068",
              "on-tertiary-fixed-variant": "#474646",
              "surface-dim": "#131313",
              "on-primary-container": "#573d00",
              "secondary-fixed-dim": "#cac6bd",
              "secondary-container": "#4b4942",
              "on-secondary-fixed-variant": "#494740",
              "primary-container": "#d4a853",
              "on-primary-fixed": "#271900",
              "border-subtle": "#1E1E1E",
              "on-primary-fixed-variant": "#5d4200",
              "error": "#B85C5C",
              "on-secondary-fixed": "#1d1c16",
              "primary": "#f2c36b",
              "surface-raised": "#1C1C1C",
              "on-primary": "#412d00",
              "surface-container-lowest": "#0e0e0e",
              "border-base": "#2A2A2A",
              "surface-tint": "#eec068",
              "error-container": "#93000a",
              "surface-container-high": "#2a2a2a",
              "surface-container-low": "#1c1b1b",
              "secondary": "#cac6bd",
              "outline-variant": "#4e4637",
              "accent-hover": "#C49840",
              "primary-fixed": "#ffdea6",
              "text-secondary": "#8A8277",
              "secondary-fixed": "#e7e2d8",
              "text-disabled": "#4A4744",
              "outline": "#9b8f7e",
              "code-bg": "#111111",
              "warning": "#A87B3A",
              "tertiary-container": "#b0aeae",
              "on-tertiary-container": "#424242",
              "tertiary-fixed-dim": "#c8c6c5",
              "success": "#4A9B6F",
              "on-tertiary": "#313030",
              "background": "#0D0D0D",
              "tertiary-fixed": "#e5e2e1",
              "tertiary": "#ccc9c9",
              "on-tertiary-fixed": "#1c1b1b",
              "on-surface-variant": "#d2c5b2",
              "on-secondary": "#32302a",
              "surface-bright": "#3a3939",
              "inverse-on-surface": "#313030",
              "on-error": "#690005",
              "on-secondary-container": "#bcb8af",
              "inverse-primary": "#7b5804",
              "surface-container-highest": "#353534",
              "surface": "#131313",
              "on-background": "#e5e2e1",
              "on-error-container": "#ffdad6",
              "inverse-surface": "#e5e2e1",
              "accent-subtle": "#2A2215",
              "text-primary": "#F0EBE1"
      },
      "borderRadius": {
              "DEFAULT": "0.25rem",
              "lg": "0.5rem",
              "xl": "0.75rem",
              "full": "9999px"
      },
      "spacing": {
              "md": "16px",
              "max-width": "1120px",
              "gutter-mobile": "24px",
              "3xl": "64px",
              "xs": "4px",
              "lg": "24px",
              "xl": "32px",
              "5xl": "128px",
              "sm": "8px",
              "gutter-desktop": "48px",
              "2xl": "48px",
              "4xl": "96px"
      },
      "fontFamily": {
              "body-sm": [
                      "DM Sans"
              ],
              "display": [
                      "Instrument Serif"
              ],
              "headline-sm": [
                      "DM Sans"
              ],
              "headline-md": [
                      "Instrument Serif"
              ],
              "body-lg": [
                      "DM Sans"
              ],
              "body": [
                      "DM Sans"
              ],
              "headline-lg": [
                      "Instrument Serif"
              ],
              "mono-sm": [
                      "JetBrains Mono"
              ],
              "display-mobile": [
                      "Instrument Serif"
              ],
              "mono-lg": [
                      "JetBrains Mono"
              ]
      },
      "fontSize": {
              "body-sm": [
                      "14px",
                      {
                              "lineHeight": "1.6",
                              "fontWeight": "400"
                      }
              ],
              "display": [
                      "72px",
                      {
                              "lineHeight": "1.05",
                              "letterSpacing": "-0.02em",
                              "fontWeight": "400"
                      }
              ],
              "headline-sm": [
                      "22px",
                      {
                              "lineHeight": "1.3",
                              "fontWeight": "500"
                      }
              ],
              "headline-md": [
                      "32px",
                      {
                              "lineHeight": "1.2",
                              "fontWeight": "400"
                      }
              ],
              "body-lg": [
                      "18px",
                      {
                              "lineHeight": "1.7",
                              "fontWeight": "400"
                      }
              ],
              "body": [
                      "16px",
                      {
                              "lineHeight": "1.65",
                              "fontWeight": "400"
                      }
              ],
              "headline-lg": [
                      "48px",
                      {
                              "lineHeight": "1.1",
                              "fontWeight": "400"
                      }
              ],
              "mono-sm": [
                      "13px",
                      {
                              "lineHeight": "1.5",
                              "fontWeight": "400"
                      }
              ],
              "display-mobile": [
                      "48px",
                      {
                              "lineHeight": "1.1",
                              "fontWeight": "400"
                      }
              ],
              "mono-lg": [
                      "16px",
                      {
                              "lineHeight": "1.5",
                              "fontWeight": "400"
                      }
              ]
      }
    },
  },
  plugins: [],
}
