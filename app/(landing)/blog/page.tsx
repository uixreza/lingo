import BlogList from "@/components/landing/BlogList";
import { getPublishedPosts, toPostCard } from "@/lib/blog";

export const revalidate = 3600;

export default async function BlogPage() {
  const posts = (await getPublishedPosts()).map(toPostCard);

  return <BlogList posts={posts} />;
}
