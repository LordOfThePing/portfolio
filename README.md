# Nextfolio

A clean, fast, and simple portfolio template built with [Next.js](https://nextjs.org/), [Vercel](https://vercel.com/), and [Tailwind CSS](https://tailwindcss.com/) for great performance.

Deploy your Nextfolio site with Vercel in minutes.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2F1msirius%2FNextfolio)

## Technologies Used

- Framework: [Next.js](https://nextjs.org/)
- Typography: [Vercel Geist Font](https://vercel.com/font)
- Styling: [Tailwind CSS](https://tailwindcss.com/)
- Analytics: [Vercel Web Analytics](https://vercel.com/docs/speed-insights) and [Speed Insights](https://vercel.com/docs/speed-insights)
- Deployment: [Vercel](https://vercel.com/)

## Features

- **MDX Support**: Use Markdown with JSX components for blog posts.
- **Light and Dark Mode Toggle**: Switch between themes for better readability.
- **Dynamic OG Images**: Auto-generate Open Graph images for sharing.
- **SEO Optimization**: Enhance search visibility with sitemap, robots.txt, and JSON-LD schema.
- **Feed Generation**: Automatic dynamic RSS, Atom, and JSON feeds.
- **[KaTeX](https://katex.org/) Integration**: Render mathematical expressions smoothly.
- **Performance Tracking**: Monitor web performance with [Vercel Web Analytics](https://vercel.com/docs/speed-insights) and [Speed Insights](https://vercel.com/docs/speed-insights).
- **Interactive Embeds**: Easily embed interactive tweets and YouTube videos.
- **Captions**: Add descriptive captions to photos, tweets, and videos.

## Running Locally

To run the website on your local machine, follow these steps:

Ensure [pnpm](https://pnpm.io) is installed on your system. If not, follow the [instructions](https://pnpm.io/installation) on their website.

```
# Download the website code with Git:
git clone https://github.com/1msirius/Nextfolio.git

# Navigate into the project directory:
cd Nextfolio

# Install the dependencies:
pnpm install

# Start the development server:
pnpm dev
```

The server will be running at [http://localhost:3000](http://localhost:3000).

## Configuration

1. Update your metadata in `app/layout.tsx`.
2. Update your site URL and routes in `app/sitemap.ts` for SEO optimization.
3. Update your title, description, and copyright in the `/app/[slug]/route.ts` to generate RSS, Atom, and JSON feeds.
4. Update your name in `app/blog/[slug]/page.tsx`.
5. Update your title in `app/og/route.tsx`.
6. Update social links and copyright info in `app/components/footer.tsx`.

For more information about configuration, follow the instructions in the [Getting Started](https://nextfolio-template.vercel.app/blog/getting-started#configuration) post.

## Contributing

Contributions are welcome! To get involved, just push your code to the repo. Whether you're enhancing existing features or adding new ones, your efforts are greatly appreciated!

## Licence

Nextfolio is open-source and released under the MIT License.
