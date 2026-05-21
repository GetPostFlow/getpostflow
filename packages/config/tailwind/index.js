/**
 * Shared Tailwind CSS v4 token preset for GetPostFlow.
 * Import in your tailwind.config.js or CSS file.
 *
 * Design tokens:
 *   bg.canvas    #F6F2EA — warm off-white page background
 *   bg.surface   #FFFDF9 — card / elevated surface
 *   bg.subtle    #EFE7DA — muted fill zones
 *   border.soft  #D8CCBA — soft dividers and outlines
 *   text.primary    #1F2430
 *   text.secondary  #5E6472
 *   text.muted      #7B8190
 *   brand.primary        #2F5D62
 *   brand.primaryHover   #274D52
 *   brand.secondary      #8C6A43
 *   brand.accent         #B9A28E
 *   brand.success        #708B75
 *   brand.warning        #A67C52
 *   brand.danger         #A35D5D
 */

/** @type {import("tailwindcss").Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        canvas: "#F6F2EA",
        surface: "#FFFDF9",
        subtle: "#EFE7DA",
        "border-soft": "#D8CCBA",
        "text-primary": "#1F2430",
        "text-secondary": "#5E6472",
        "text-muted": "#7B8190",
        "brand-primary": "#2F5D62",
        "brand-primary-hover": "#274D52",
        "brand-secondary": "#8C6A43",
        "brand-accent": "#B9A28E",
        "brand-success": "#708B75",
        "brand-warning": "#A67C52",
        "brand-danger": "#A35D5D",
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
        subtitle: ["Montserrat", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
    },
  },
};
