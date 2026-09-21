'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Container,
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Breadcrumbs,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { BLOG_POSTS } from '@/lib/blogData';

const CATEGORIES = ['All', 'Route Guides', 'Travel Tips', 'Comparisons', 'Technology', 'Budget Travel', 'Safety'];

export default function BlogIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory =
      selectedCategory === 'All' || post.category.toLowerCase() === selectedCategory.toLowerCase();
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      post.title.toLowerCase().includes(q) ||
      post.description.toLowerCase().includes(q) ||
      post.category.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        {/* Breadcrumb */}
        <Breadcrumbs sx={{ mb: 3, fontSize: '0.85rem' }}>
          <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>
            Home
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 650 }}>
            Travel Blog
          </Typography>
        </Breadcrumbs>

        {/* Hero Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.6,
              borderRadius: 5,
              bgcolor: 'rgba(220, 38, 38, 0.08)',
              color: '#DC2626',
              mb: 2,
            }}
          >
            <MenuBookIcon sx={{ fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Stories, Guides & Highway Insights
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', mb: 1.5 }}>
            NextBus Travel Journal
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 650, mx: 'auto', mb: 4 }}>
            Expert route advice, coach comparisons, money-saving tips, and mobility tech guides for Indian travelers.
          </Typography>

          {/* Search Box */}
          <Box sx={{ maxWidth: 550, mx: 'auto' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search travel articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                bgcolor: '#FFFFFF',
                borderRadius: 2.5,
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  '& fieldset': { borderColor: '#E2E8F0' },
                  '&:hover fieldset': { borderColor: '#DC2626' },
                },
              }}
            />
          </Box>
        </Box>

        {/* Category Filter Tabs */}
        <Paper sx={{ mb: 4, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none', bgcolor: '#fff' }}>
          <Tabs
            value={selectedCategory}
            onChange={(e, val) => setSelectedCategory(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              py: 0.5,
              '& .MuiTab-root': { fontWeight: 750, fontSize: '0.86rem', minHeight: 46 },
              '& .Mui-selected': { color: '#DC2626' },
              '& .MuiTabs-indicator': { bgcolor: '#DC2626' },
            }}
          >
            {CATEGORIES.map((cat) => (
              <Tab key={cat} value={cat} label={cat} />
            ))}
          </Tabs>
        </Paper>

        {/* Articles Grid */}
        {filteredPosts.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed #CBD5E1' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#64748B', mb: 1 }}>
              No articles found matching &ldquo;{searchQuery}&rdquo;
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              sx={{ borderColor: '#DC2626', color: '#DC2626', fontWeight: 700 }}
            >
              Show All Articles
            </Button>
          </Card>
        ) : (
          <Grid container spacing={3.5}>
            {filteredPosts.map((post) => (
              <Grid item xs={12} sm={6} lg={4} key={post.slug}>
                <Card
                  sx={{
                    borderRadius: 3.5,
                    border: '1px solid #E2E8F0',
                    boxShadow: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      boxShadow: '0 12px 30px rgba(0,0,0,0.07)',
                      transform: 'translateY(-4px)',
                      borderColor: '#CBD5E1',
                    },
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={post.image}
                      alt={post.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <Chip
                      label={post.category}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        bgcolor: 'rgba(15, 23, 42, 0.85)',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        backdropFilter: 'blur(6px)',
                      }}
                    />
                  </Box>

                  <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Metadata */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarTodayIcon sx={{ fontSize: 13, color: '#94A3B8' }} />
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 650 }}>
                          {post.date}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 13, color: '#94A3B8' }} />
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 650 }}>
                          {post.readTime}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      component={Link}
                      href={`/blog/${post.slug}`}
                      sx={{
                        fontWeight: 850,
                        color: '#0F172A',
                        lineHeight: 1.35,
                        mb: 1.5,
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                        '&:hover': { color: '#DC2626' },
                      }}
                    >
                      {post.title}
                    </Typography>

                    {/* Short Description */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1, lineHeight: 1.6 }}>
                      {post.description}
                    </Typography>

                    {/* Read More Button */}
                    <Box sx={{ pt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                        By {post.author}
                      </Typography>
                      <Button
                        component={Link}
                        href={`/blog/${post.slug}`}
                        size="small"
                        endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          fontWeight: 800,
                          color: '#DC2626',
                          p: 0,
                          '&:hover': { bgcolor: 'transparent', transform: 'translateX(3px)' },
                          transition: 'transform 0.2s',
                        }}
                      >
                        Read More
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
