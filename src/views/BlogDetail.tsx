import React from 'react';
import { useParams, Link } from '@/lib/next-router';
import { Calendar, User, Clock, ArrowLeft, Tag, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import PageMeta from '@/components/common/PageMeta';
import { blogPosts } from '@/data/blog';
import NotFound from './NotFound';

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find(p => p.id === Number(id));

  if (!post) {
    return <NotFound />;
  }

  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3);
  const relatedService = post.category === 'Web Development'
    ? { label: 'Website development services', href: '/services/web-development' }
    : post.category === 'Mobile Development'
      ? { label: 'Mobile app development services', href: '/services/mobile-app-development' }
      : post.category === 'IT Support'
        ? { label: 'Business IT support', href: '/services/it-support' }
        : undefined;

  return (
    <>
      <PageMeta 
        title={`${post.title} - VedTech Blog`}
        description={post.excerpt}
      />
      <div className="flex flex-col w-full bg-slate-50">
        {/* Progress Bar (Visual only) */}
        <div className="fixed top-16 left-0 w-full h-1 bg-slate-200 z-50">
          <div className="h-full bg-primary animate-pulse" style={{ width: '30%' }} />
        </div>

        {/* Hero Header */}
        <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 bg-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover blur-sm scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-900" />
          </div>

          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto space-y-8">
              <Button asChild variant="ghost" className="text-slate-300 hover:text-white -ml-4">
                <Link to="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Link>
              </Button>

              <div className="space-y-6">
                <Badge className="bg-primary text-white text-sm py-1 px-4">{post.category}</Badge>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-slate-300 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 md:py-20 -mt-16 relative z-20">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-8">
                <Card className="shadow-2xl border-none">
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-slate-200">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-8 md:p-12 prose prose-slate max-w-none">
                    <div className="whitespace-pre-line text-lg leading-relaxed text-slate-700">
                      {post.content}
                    </div>

                    {/* Tags */}
                    <div className="mt-12 pt-8 border-t flex flex-wrap gap-2">
                      <Tag className="h-5 w-5 text-slate-400 mr-2" />
                      {post.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Social Share */}
                    <div className="mt-8 pt-8 border-t flex items-center justify-between">
                      <span className="font-semibold text-slate-900 flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-primary" />
                        Share this article:
                      </span>
                      <div className="flex gap-4">
                        <Button size="icon" variant="outline" className="rounded-full hover:bg-blue-50 text-blue-600">
                          <Facebook className="h-5 w-5" />
                        </Button>
                        <Button size="icon" variant="outline" className="rounded-full hover:bg-sky-50 text-sky-500">
                          <Twitter className="h-5 w-5" />
                        </Button>
                        <Button size="icon" variant="outline" className="rounded-full hover:bg-blue-50 text-blue-700">
                          <Linkedin className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Author Bio */}
                <div className="mt-12 bg-white p-8 rounded-xl shadow-lg border-l-4 border-primary">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-primary">
                      <User className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-slate-900">{post.author}</h4>
                      <p className="text-slate-600">IT Solutions Specialist at VedTech Services. Passionate about helping businesses leverage technology for growth and security.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-4 space-y-8">
                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-slate-900">Related Articles</h3>
                    <div className="space-y-4">
                      {relatedPosts.map(rp => (
                        <Link key={rp.id} to={`/blog/${rp.id}`} className="group block">
                          <Card className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="flex gap-4 p-4">
                              <div className="h-20 w-20 shrink-0 rounded-md overflow-hidden bg-slate-200">
                                <img src={rp.image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                              </div>
                              <div className="space-y-1">
                                <Badge className="text-[10px] py-0">{rp.category}</Badge>
                                <h4 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors">{rp.title}</h4>
                                <span className="text-[10px] text-slate-500">{rp.date}</span>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA Card */}
                <Card className="bg-primary text-white overflow-hidden">
                  <CardContent className="p-8 space-y-6">
                    <h3 className="text-2xl font-bold">Need Custom Solutions?</h3>
                    <p className="text-blue-100">
                      Our expert team is ready to help you with your next software, hardware, or web project.
                    </p>
                    <Button asChild variant="secondary" className="w-full font-bold">
                      <Link to="/contact">Book Free Consultation</Link>
                    </Button>
                    {relatedService && (
                      <Link to={relatedService.href} className="block text-center text-sm font-semibold text-white underline underline-offset-4">
                        Explore {relatedService.label}
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BlogDetail;
