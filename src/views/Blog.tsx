import React from 'react';
import { Calendar, User, ArrowRight, Tag, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/lib/next-router';
import PageMeta from '@/components/common/PageMeta';
import { blogPosts } from '@/data/blog';

const Blog: React.FC = () => {
  const categories = ["All", "Security", "Web Development", "IT Support", "Mobile Development", "Knowledge Base", "How-to Guides"];
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  const filteredPosts = selectedCategory === "All" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <>
      <PageMeta 
        title="VedTech Services Blog — IT Tips, Guides & Technology Insights"
        description="Read expert articles on IT services, web development, cybersecurity, and business technology. Get practical tips and insights from VedTech Services professionals."
        canonical="/blog"
      />
      <div className="flex flex-col w-full">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <Badge className="bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border-blue-400/30">
                <TrendingUp className="h-3 w-3 mr-1" />
                Latest Insights
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">VedTech Blog</h1>
              <p className="text-slate-300 text-lg">
                Expert insights, practical tips, and the latest trends in IT services and technology
              </p>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 bg-white border-b sticky top-0 z-40">
          <div className="container">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="transition-all duration-300"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-10">Articles and practical guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-transparent hover:border-primary/30">
                  <div className="relative aspect-video overflow-hidden bg-slate-200">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary text-white">{post.category}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-6 md:p-8 space-y-4">
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-slate-600 line-clamp-3">{post.excerpt}</p>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      {post.tags.map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                      <Button asChild variant="ghost" size="sm" className="group-hover:text-primary">
                        <Link to={`/blog/${post.id}`} className="flex items-center">
                          Read More <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 bg-gradient-to-br from-primary via-blue-600 to-primary text-white">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Stay Updated</h2>
              <p className="text-blue-100 text-lg">
                Subscribe to our newsletter for the latest IT tips, industry insights, and exclusive offers
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Button asChild size="lg" variant="secondary" className="flex-1">
                  <Link to="/contact">
                    Subscribe Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Blog;
