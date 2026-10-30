import { notFound } from "next/navigation";
import BlogPostView from "@/components/landing/BlogPostView";
import {
  getPublishedPost,
  getPublishedPosts,
  getPublishedSlugs,
  toPostCard,
  toPostDetail,
} from "@/lib/blog";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();

  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  if (!post) notFound();

  const allPosts = await getPublishedPosts();
  const related = allPosts
    .filter((item) => item.slug !== post.slug)
    .slice(0, 4)
    .map(toPostCard);

  return <BlogPostView post={toPostDetail(post)} related={related} />;
}
