"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InstagramEmbed } from "@/components/instagram-embed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Trash2 } from "lucide-react";
import { getBotPosts } from "@/app/api/bot";
import { useRouter } from 'next/navigation';
import { Post } from "@/types/types";

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[] | null>(null); // Allow null initial state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAddPost = () => {
    router.push('/posts/add');
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError("");
      setPosts(null); // Reset posts to null before fetching
      try {
        const data = await getBotPosts();
        setPosts(data ?? []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || "Failed to fetch posts");
      }
      setLoading(false);
    };

    fetchPosts();
    const intervalId = setInterval(fetchPosts, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");

  const handleDeletePost = (id: string) => {
    if (!posts) return;
    setPosts(posts.filter((post) => post.id !== id));
  };

  const filteredPosts = posts
    ? posts
    // posts.filter(
    //     (post) =>
    //       post.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //       post.description.toLowerCase().includes(searchQuery.toLowerCase())
    //   )
    : [];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title="Instagram Posts" />
      <main className="flex-1 p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Instagram Posts</CardTitle>
            <CardDescription>
              View and manage Instagram posts for your bot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <p className="text-red-600 font-semibold mb-2">{error}</p>
            )}
            <div className="relative flex gap-2">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button onClick={handleAddPost}>
                <Plus className="mr-2 h-4 w-4" />
                Add Post
              </Button>
            </div>

            {loading && <p>Loading posts...</p>}
            {!loading && posts && (
              <Tabs defaultValue="grid" className="mt-6">
                <TabsList className="mb-4">
                  <TabsTrigger value="grid">Grid View</TabsTrigger>
                  <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>

                <TabsContent value="grid">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPosts.map((post) => (
                      <div key={post.id} className="relative border rounded shadow-sm hover:shadow-md transition overflow-hidden flex flex-col bg-white dark:bg-gray-800">
                        {/* Top bar: username and delete button */}
                        <div className="flex justify-between items-center p-3 border-b bg-gray-50 dark:bg-gray-700">
                          <div className="font-medium truncate flex-1 mr-2" title={post.username}>
                            {post.username}
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                            aria-label="Delete post"
                            className="flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Instagram embed - let it size naturally */}
                        <div className="flex justify-center items-center p-4 min-h-[400px]">
                          <div className="w-full max-w-[328px]">
                            <InstagramEmbed
                              permalink={`https://www.instagram.com/p/${post.shortcode}/`}
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div className="p-3 text-sm text-muted-foreground border-t bg-gray-50 dark:bg-gray-700">
                          <p className="line-clamp-2" title={post.description}>
                            {post.description || "No description"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="list">
                  <div className="space-y-4">
                    {filteredPosts.map((post) => (
                      <div
                        key={post.id}
                        className="border p-4 rounded flex flex-col md:flex-row gap-4"
                      >
                        <div className="md:w-1/3">
                          <InstagramEmbed
                            permalink={`https://www.instagram.com/p/${post.shortcode}/`}
                          />
                        </div>
                        <div className="md:w-2/3 flex flex-col justify-between">
                          <div>
                            <h3 className="font-medium text-lg">{post.username}</h3>
                            <p className="text-muted-foreground">{post.description}</p>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
            {!loading && posts === null && <p>No posts available.</p>}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
