'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Card,
  CardMedia,
  Breadcrumbs,
  Chip,
  Button,
  Grid,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import ShareIcon from '@mui/icons-material/Share';
import { getBlogPostBySlug, BLOG_POSTS } from '@/lib/blogData';

export default function BlogPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;

  const post = getBlogPostBySlug(slug);

  if (!post) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
          Article Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The requested travel article could not be located.
        </Typography>
        <Button component={Link} href="/blog" variant="contained" sx={{ bgcolor: '#DC2626', fontWeight: 700 }}>
          Back to All Articles
        </Button>
      </Container>
    );
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
        {/* Navigation / Breadcrumb */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Breadcrumbs sx={{ fontSize: '0.85rem' }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>
              Home
            </Link>
            <Link href="/blog" style={{ color: '#64748B', textDecoration: 'none' }}>
              Blog
            </Link>
            <Typography color="text.primary" sx={{ fontWeight: 650, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {post.title}
            </Typography>
          </Breadcrumbs>

          <Button
            component={Link}
            href="/blog"
            size="small"
            startIcon={<ArrowBackIcon />}
            sx={{ fontWeight: 700, color: '#334155' }}
          >
            All Articles
          </Button>
        </Box>

        {/* Article Container */}
        <Card sx={{ borderRadius: 4, border: '1px solid #E2E8F0', boxShadow: '0 8px 30px rgba(0,0,0,0.03)', overflow: 'hidden', bgcolor: '#FFFFFF', mb: 6 }}>
          {/* Header Media */}
          <CardMedia
            component="img"
            height="380"
            image={post.image}
            alt={post.title}
            sx={{ objectFit: 'cover' }}
          />

          <Box sx={{ p: { xs: 3, sm: 5 } }}>
            {/* Badges & Meta */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 2.5 }}>
              <Chip
                label={post.category}
                sx={{ bgcolor: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', fontWeight: 800, fontSize: '0.75rem' }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <CalendarTodayIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 650 }}>
                  {post.date}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <AccessTimeIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 650 }}>
                  {post.readTime}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <PersonIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 650 }}>
                  {post.author}
                </Typography>
              </Box>
            </Box>

            {/* Title */}
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.25, mb: 3, letterSpacing: '-0.02em' }}>
              {post.title}
            </Typography>

            {/* Short Intro Callout */}
            <Box sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#F8FAFC', borderLeft: '4px solid #DC2626', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#334155', fontStyle: 'italic', lineHeight: 1.7, fontWeight: 550 }}>
                {post.description}
              </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Main Article Body */}
            <Box sx={{ '& h3': { fontWeight: 850, color: '#0F172A', mt: 4, mb: 1.5, fontSize: '1.25rem' } }}>
              <Typography
                variant="body1"
                sx={{
                  color: '#334155',
                  lineHeight: 1.9,
                  fontSize: '1.05rem',
                  whiteSpace: 'pre-line',
                }}
              >
                {post.content}
              </Typography>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Footer / Share */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                Published on NextBus Travel Media Network
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleShare}
                startIcon={<ShareIcon />}
                sx={{ borderColor: '#CBD5E1', color: '#334155', fontWeight: 700, borderRadius: 2 }}
              >
                Share Article
              </Button>
            </Box>
          </Box>
        </Card>

        {/* Related Articles */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 850, color: '#0F172A', mb: 3 }}>
            More Travel Guides
          </Typography>
          <Grid container spacing={3}>
            {relatedPosts.map((rel) => (
              <Grid item xs={12} sm={4} key={rel.slug}>
                <Card
                  component={Link}
                  href={`/blog/${rel.slug}`}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: '1px solid #E2E8F0',
                    boxShadow: 'none',
                    display: 'block',
                    textDecoration: 'none',
                    height: '100%',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: '#DC2626', transform: 'translateY(-2px)' },
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 800, textTransform: 'uppercase' }}>
                    {rel.category}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5, lineHeight: 1.3 }}>
                    {rel.title}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
