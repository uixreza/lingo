import type { Metadata } from "next";
import { prisma } from "@/lib/auth";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      select: {
        title: true,
        content: true,
        tags: true,
        publishedAt: true,
        updatedAt: true,
        thumbnailUrl: true,
        author: { select: { fullname: true } },
      },
    });

    if (!post) {
      return { title: "مقاله یافت نشد — لینگوفام" };
    }

    const description = post.content.replace(/<[^>]*>/g, "").trim().slice(0, 160);

    const ogImage = post.thumbnailUrl || "https://lingofam.ir/mainIcon.webp";

    return {
      title: `${post.title} — لینگوفام`,
      description,
      keywords: post.tags ?? [],
      authors: [{ name: post.author.fullname }],
      openGraph: {
        title: post.title,
        description,
        type: "article",
        publishedTime: post.publishedAt?.toISOString(),
        modifiedTime: post.updatedAt?.toISOString(),
        authors: [post.author.fullname],
        images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
        siteName: "لینگوفام",
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
  } catch {
    return { title: "مقاله — لینگوفام" };
  }
}

export default async function BlogSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let jsonLd = null;
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      select: {
        title: true,
        content: true,
        publishedAt: true,
        updatedAt: true,
        thumbnailUrl: true,
        slug: true,
        author: { select: { fullname: true } },
      },
    });

    if (post) {
      const description = post.content.replace(/<[^>]*>/g, "").trim().slice(0, 160);
      const image = post.thumbnailUrl || "https://lingofam.ir/mainIcon.webp";

      jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description,
        image,
        url: `https://lingofam.ir/blog/${post.slug}`,
        datePublished: post.publishedAt?.toISOString(),
        dateModified: post.updatedAt?.toISOString(),
        author: {
          "@type": "Person",
          name: post.author.fullname,
        },
        publisher: {
          "@type": "Organization",
          name: "لینگوفام",
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
  } catch {
    // skip
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
