# SEO Assets for InfraCrafter

## Required Images for SEO

To complete the SEO setup, please add the following images to the `/public` folder:

### 1. Open Graph Image
- **Filename:** `og-image.png`
- **Size:** 1200x630px
- **Purpose:** Displayed when sharing on Facebook, LinkedIn, Slack
- **Content:** Screenshot of the app or branded graphic with logo

### 2. Twitter Card Image
- **Filename:** `twitter-image.png`
- **Size:** 1200x600px
- **Purpose:** Displayed when sharing on Twitter/X
- **Content:** Screenshot of the app or branded graphic with logo

### 3. App Screenshot
- **Filename:** `screenshot.png`
- **Size:** 1280x720px or larger
- **Purpose:** Schema.org structured data, app stores, documentation
- **Content:** Clean screenshot showing the main interface with a sample diagram

### 4. App Icon
- **Filename:** `app-icon.png`
- **Size:** 512x512px
- **Purpose:** Schema.org structured data, app icon representation
- **Content:** Your app logo/icon on transparent or white background

## Tips for Creating Images

### For OG/Twitter Images:
- Include the InfraCrafter logo
- Show a sample AWS VPC diagram
- Add text overlay: "Visual AWS VPC Builder" or "Generate Terraform from Diagrams"
- Use brand colors
- Keep text readable (minimum 30px font size)

### For Screenshot:
- Show a complete VPC diagram with:
  - VPC containing subnets
  - EC2 instances
  - Route tables with connections
  - Internet gateway
- Clean, professional look
- No debug/development artifacts

### For App Icon:
- Simple, recognizable logo
- Works well at small sizes
- Transparent background preferred
- Represents "infrastructure" or "cloud architecture"

## Current SEO Implementation

✅ Meta tags (title, description, keywords)
✅ Open Graph tags (Facebook, LinkedIn)
✅ Twitter Card tags
✅ Schema.org structured data (SoftwareApplication, WebApplication, BreadcrumbList)
✅ Canonical URL
✅ robots.txt
✅ sitemap.xml
✅ Favicon

## After Adding Images

Once you add the images, verify SEO using:
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

## Domain Configuration

Before launch, update these URLs in `index.html`:
- Change `https://infracrafter.com` to your actual domain
- Update canonical URL
- Update og:url and twitter:url
- Update sitemap.xml location in robots.txt

## Additional SEO Recommendations

1. **Add Google Analytics** - Track user behavior and traffic sources
2. **Add Google Search Console** - Monitor search performance and indexing
3. **Create blog content** - Tutorials on AWS VPC, Terraform best practices
4. **Build backlinks** - Share on developer communities (Reddit, HackerNews, Dev.to)
5. **Add FAQ section** - Common questions about the tool (adds more keywords)
6. **Add testimonials** - Social proof improves conversion and trust signals
7. **Page load optimization** - Already good with Vite, but monitor with Lighthouse
8. **Mobile responsiveness** - Ensure the canvas works well on tablets
