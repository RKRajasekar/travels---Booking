'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Container,
  Box,
  Typography,
  Card,
  Grid,
  Breadcrumbs,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';

const JOBS = [
  {
    id: 'job-1',
    title: 'Senior Frontend Developer (React.js)',
    location: 'Chennai, TN / Remote (Hybrid)',
    type: 'Full-time',
    experience: '3 - 5 Years',
    department: 'Engineering',
    salary: '₹14,00,000 - ₹20,00,000 PA',
    description:
      'Build ultra-responsive, real-time bus and cab booking interfaces. You will architect high-performance UI components, optimize interactive SVG seat pickers, and build live Leaflet/GPS tracking dashboards.',
    responsibilities: [
      'Architect scalable, accessible React.js and Next.js frontend features.',
      'Work with WebSocket streams and Leaflet maps for sub-second bus GPS telemetry.',
      'Collaborate closely with UI/UX designers to implement premium transit booking workflows.',
      'Optimize web vitals, mobile responsiveness, and bundle size performance.',
    ],
    requirements: [
      'Deep proficiency in React.js, JavaScript (ES6+), and CSS/Material UI.',
      'Experience with state management, custom hooks, and server-side rendering in Next.js.',
      'Familiarity with web mapping libraries (Leaflet, Mapbox, or Google Maps API).',
      'Track record of shipping customer-facing web apps with high availability.',
    ],
  },
  {
    id: 'job-2',
    title: 'Lead Backend Developer (Node.js & MongoDB)',
    location: 'Bangalore, KA / Hybrid',
    type: 'Full-time',
    experience: '4 - 7 Years',
    department: 'Engineering',
    salary: '₹18,00,000 - ₹26,00,000 PA',
    description:
      'Design and scale real-time booking engines, multi-operator inventory sync pipelines, and high-throughput payment gateways handling thousands of bookings per hour.',
    responsibilities: [
      'Design resilient REST & Server Action APIs for bus schedule searches and cab allocations.',
      'Maintain MongoDB database clusters, indexing strategies, and Prisma ORM schemas.',
      'Implement distributed seat-locking mechanisms to prevent double bookings.',
      'Integrate payment aggregators, automated refund triggers, and SMS notification gateways.',
    ],
    requirements: [
      'Strong expertise in Node.js, Express/Next.js backend, and MongoDB database architecture.',
      'Hands-on experience designing concurrent transaction systems and caching with Redis.',
      'Understanding of authentication protocols (NextAuth, JWT) and security best practices.',
    ],
  },
  {
    id: 'job-3',
    title: 'Technical Product Manager (Transit Mobility)',
    location: 'Chennai, TN / On-site',
    type: 'Full-time',
    experience: '3 - 6 Years',
    department: 'Product',
    salary: '₹16,00,000 - ₹22,00,000 PA',
    description:
      'Drive the product roadmap for NextBus passenger apps and our Travel Owner Fleet Management portal. Bridge user feedback with engineering execution.',
    responsibilities: [
      'Define product vision for intercity bus travel and on-demand highway cab services.',
      'Conduct user interviews with fleet operators to optimize the Travel Owner Dashboard.',
      'Write detailed PRDs, user stories, and track feature adoption metrics.',
      'Coordinate feature launches across engineering, operations, and partner operators.',
    ],
    requirements: [
      'Proven experience as a Product Manager in mobility, travel-tech, or marketplace platforms.',
      'Strong analytical mindset, data-driven prioritization, and user empathy.',
    ],
  },
  {
    id: 'job-4',
    title: 'UI/UX Product Designer',
    location: 'Remote / Bangalore',
    type: 'Full-time',
    experience: '2 - 4 Years',
    department: 'Design',
    salary: '₹10,00,000 - ₹15,00,000 PA',
    description:
      'Craft visually stunning, intuitive digital experiences across web and mobile. Elevate NextBus’s premium brand identity and streamline seat selection.',
    responsibilities: [
      'Design modern interactive mockups, design tokens, and user flow wireframes in Figma.',
      'Create intuitive visualizations for live GPS vehicle tracking and ticket boarding passes.',
      'Conduct usability testing to streamline checkout friction and increase conversions.',
    ],
    requirements: [
      'Impressive design portfolio showcasing consumer-facing web or mobile applications.',
      'Mastery of Figma, typography, responsive grid systems, and micro-animations.',
    ],
  },
  {
    id: 'job-5',
    title: 'Customer Support Lead (24x7 Operations)',
    location: 'Chennai, TN / Shift-based',
    type: 'Full-time',
    experience: '1 - 3 Years',
    department: 'Operations',
    salary: '₹4,50,000 - ₹7,00,000 PA',
    description:
      'Be the voice of NextBus. Help passengers with ticket modifications, live boarding queries, refund processing, and travel operator coordination.',
    responsibilities: [
      'Resolve passenger queries via phone, chat, and email with empathy and speed.',
      'Coordinate with bus conductors and cab chauffeurs during transit emergencies.',
      'Expedite refund requests and track issue resolutions in our support CRM.',
    ],
    requirements: [
      'Excellent verbal and written communication in English, Tamil, and Hindi/Telugu.',
      'Prior experience in travel, hospitality, or e-commerce customer support.',
    ],
  },
  {
    id: 'job-6',
    title: 'Fleet Operations Executive',
    location: 'Coimbatore / Salem, TN',
    type: 'Full-time',
    experience: '2 - 4 Years',
    department: 'Fleet & Partner Relations',
    salary: '₹6,00,000 - ₹9,00,000 PA',
    description:
      'Onboard and support verified bus travel operators and cab owners. Ensure vehicle compliance, driver GPS readiness, and onboard service quality.',
    responsibilities: [
      'Onboard new travel operators onto the Travel Owner Dashboard portal.',
      'Conduct periodic vehicle audits and driver compliance checks.',
      'Monitor real-time route punctuality and troubleshoot operator fleet concerns.',
    ],
    requirements: [
      'Background in transport logistics, fleet operations, or partner relationship management.',
      'Strong negotiation, organizational, and problem-solving skills.',
    ],
  },
];

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experienceYears: '',
    resumeLink: '',
    portfolioLink: '',
    coverLetter: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setViewDialogOpen(true);
  };

  const handleOpenApply = (job) => {
    setSelectedJob(job);
    setViewDialogOpen(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      experienceYears: '',
      resumeLink: '',
      portfolioLink: '',
      coverLetter: '',
    });
    setFormErrors({});
    setApplyDialogOpen(true);
  };

  const handleFieldChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errors.email = 'Valid email is required';
    if (!formData.phone.trim() || formData.phone.length < 10) errors.phone = 'Valid 10-digit phone number is required';
    if (!formData.resumeLink.trim()) errors.resumeLink = 'Resume / LinkedIn URL is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setApplyDialogOpen(false);
      setSnackbar({
        open: true,
        message: `Application submitted successfully for ${selectedJob?.title}! Our recruiting team will review your application within 48 hours.`,
        severity: 'success',
      });
    }, 1200);
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        {/* Breadcrumb */}
        <Breadcrumbs sx={{ mb: 3, fontSize: '0.85rem' }}>
          <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>
            Home
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 650 }}>
            Careers
          </Typography>
        </Breadcrumbs>

        {/* Hero Banner */}
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
            <WorkIcon sx={{ fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              We Are Hiring Top Talent
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', mb: 1.5 }}>
            Shape the Future of Transit
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 650, mx: 'auto', lineHeight: 1.6 }}>
            Join our mission to revolutionize bus and cab mobility across India with real-time GPS tracking, premium coaches, and world-class technology.
          </Typography>
        </Box>

        {/* Perks Bar */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {[
            { title: 'Competitive Compensation', desc: 'Above industry pay with performance bonuses & equity' },
            { title: 'Flexible Work Culture', desc: 'Hybrid and remote-friendly options with flexible hours' },
            { title: 'Comprehensive Healthcare', desc: 'Full medical insurance coverage for you and your family' },
            { title: 'Free Annual Travel', desc: 'Complimentary transit passes on all NextBus routes' },
          ].map((perk, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none', height: '100%' }}>
                <CheckCircleIcon sx={{ color: '#10B981', fontSize: 26, mb: 1.5 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                  {perk.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5, display: 'block' }}>
                  {perk.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Job Listings Grid */}
        <Typography variant="h5" sx={{ fontWeight: 850, color: '#0F172A', mb: 3 }}>
          Open Opportunities ({JOBS.length})
        </Typography>

        <Grid container spacing={3}>
          {JOBS.map((job) => (
            <Grid item xs={12} md={6} key={job.id}>
              <Card
                sx={{
                  p: 3.5,
                  borderRadius: 3.5,
                  border: '1px solid #E2E8F0',
                  boxShadow: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  '&:hover': {
                    boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
                    transform: 'translateY(-2px)',
                    borderColor: '#CBD5E1',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 850, color: '#0F172A', lineHeight: 1.3 }}>
                    {job.title}
                  </Typography>
                  <Chip
                    label={job.type}
                    size="small"
                    sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 800, fontSize: '0.72rem', flexShrink: 0 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon sx={{ fontSize: 16, color: '#DC2626' }} />
                    <Typography variant="caption" sx={{ color: '#475569', fontWeight: 650 }}>
                      {job.location}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 16, color: '#64748B' }} />
                    <Typography variant="caption" sx={{ color: '#475569', fontWeight: 650 }}>
                      Exp: {job.experience}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1, lineHeight: 1.6 }}>
                  {job.description}
                </Typography>

                <Box sx={{ pt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#059669', fontSize: '0.85rem' }}>
                    {job.salary}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleViewJob(job)}
                      sx={{ borderColor: '#CBD5E1', color: '#334155', fontWeight: 700, borderRadius: 2 }}
                    >
                      View Job
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleOpenApply(job)}
                      sx={{ bgcolor: '#DC2626', color: '#fff', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#B91C1C' } }}
                    >
                      Apply Now
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* View Job Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}>
        {selectedJob && (
          <>
            <DialogTitle sx={{ fontWeight: 850, color: '#0F172A' }}>
              {selectedJob.title}
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {selectedJob.department} • {selectedJob.location} • {selectedJob.salary}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                Role Overview:
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.7 }}>
                {selectedJob.description}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                Key Responsibilities:
              </Typography>
              <Box component="ul" sx={{ pl: 2.5, mb: 2.5 }}>
                {selectedJob.responsibilities.map((r, i) => (
                  <Typography component="li" variant="body2" color="text.secondary" key={i} sx={{ mb: 0.6, lineHeight: 1.6 }}>
                    {r}
                  </Typography>
                ))}
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                Requirements & Skills:
              </Typography>
              <Box component="ul" sx={{ pl: 2.5 }}>
                {selectedJob.requirements.map((req, i) => (
                  <Typography component="li" variant="body2" color="text.secondary" key={i} sx={{ mb: 0.6, lineHeight: 1.6 }}>
                    {req}
                  </Typography>
                ))}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={() => setViewDialogOpen(false)} sx={{ color: '#64748B', fontWeight: 700 }}>
                Close
              </Button>
              <Button
                variant="contained"
                onClick={() => handleOpenApply(selectedJob)}
                sx={{ bgcolor: '#DC2626', fontWeight: 700, '&:hover': { bgcolor: '#B91C1C' } }}
              >
                Apply for Position
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Apply Now Form Dialog */}
      <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 850, color: '#0F172A' }}>
          Apply for {selectedJob?.title}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Submit your credentials directly to our talent acquisition team.
          </Typography>
        </DialogTitle>
        <form onSubmit={handleApplySubmit}>
          <DialogContent dividers>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name *"
                  fullWidth
                  size="small"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email Address *"
                  type="email"
                  fullWidth
                  size="small"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number *"
                  fullWidth
                  size="small"
                  placeholder="+91 98400 12345"
                  value={formData.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Years of Experience"
                  fullWidth
                  size="small"
                  placeholder="e.g. 4 years"
                  value={formData.experienceYears}
                  onChange={(e) => handleFieldChange('experienceYears', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Resume Link / LinkedIn Profile URL *"
                  fullWidth
                  size="small"
                  placeholder="https://linkedin.com/in/... or Google Drive link"
                  value={formData.resumeLink}
                  onChange={(e) => handleFieldChange('resumeLink', e.target.value)}
                  error={!!formErrors.resumeLink}
                  helperText={formErrors.resumeLink}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="GitHub / Portfolio Website (Optional)"
                  fullWidth
                  size="small"
                  placeholder="https://github.com/..."
                  value={formData.portfolioLink}
                  onChange={(e) => handleFieldChange('portfolioLink', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Why are you a great fit? (Short Cover Note)"
                  multiline
                  rows={3}
                  fullWidth
                  size="small"
                  value={formData.coverLetter}
                  onChange={(e) => handleFieldChange('coverLetter', e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setApplyDialogOpen(false)} disabled={submitting} sx={{ color: '#64748B', fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
              sx={{ bgcolor: '#DC2626', fontWeight: 700, '&:hover': { bgcolor: '#B91C1C' } }}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ fontWeight: 700, borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
