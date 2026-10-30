import type { Metadata } from "next";
import { getPublishedPost, normalizeSlug } from "@/lib/blog";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);
  const post = await getPublishedPost(slug);

  if (!post) {
    return {
      title: "مقاله یافت نشد — لینگوفم",
      robots: { index: false, follow: false },
    };
  }

  const description =
    post.metaDescription?.trim() ||
    post.content.replace(/<[^>]*>/g, "").trim().slice(0, 160);

  const ogImage = post.thumbnailUrl || "https://lingofam.ir/mainIcon.webp";

  return {
    title: `${post.title} — لینگوفم`,
    description,
    keywords: post.tags ?? [],
    authors: [{ name: post.author.fullname }],
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.fullname],
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
      siteName: "لینگوفم",
      locale: "fa_IR",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://lingofam.ir/blog/${slug}`,
    },
  };
}

export default async function BlogSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  let jsonLd = null;

  if (post) {
    const description =
      post.metaDescription?.trim() ||
      post.content.replace(/<[^>]*>/g, "").trim().slice(0, 160);
    const image = post.thumbnailUrl || "https://lingofam.ir/mainIcon.webp";

    jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description,
      image,
      url: `https://lingofam.ir/blog/${post.slug}`,
      datePublished: post.publishedAt?.toISOString(),
      dateModified: post.updatedAt.toISOString(),
      author: {
        "@type": "Person",
        name: post.author.fullname,
      },
      publisher: {
        "@type": "Organization",
        name: "لینگوفم",
        logo: {
          "@type": "ImageObject",
          url: "https://lingofam.ir/mainIcon.webp",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://lingofam.ir/blog/${post.slug}`,
      },
    };
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      {children}
    </>
  );
}
