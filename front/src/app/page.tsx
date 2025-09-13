'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  People as PeopleIcon,
  Token as TokenIcon,
} from '@mui/icons-material';

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Regulatory Compliance',
      description: 'Built-in KYC/AML verification and regulatory compliance features to ensure full legal compliance.',
    },
    {
      icon: <TokenIcon sx={{ fontSize: 40 }} />,
      title: 'Token Management',
      description: 'Comprehensive token lifecycle management with locking, vesting, and transfer controls.',
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: 'Investor Management',
      description: 'Complete investor onboarding, verification, and portfolio management system.',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: 'Investment Tracking',
      description: 'Real-time investment tracking and settlement with automated compliance checks.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Fast Settlement',
      description: 'Automated settlement processes with bank integration and real-time fund verification.',
    },
    {
      icon: <AccountBalanceIcon sx={{ fontSize: 40 }} />,
      title: 'Multi-Chain Support',
      description: 'Support for multiple blockchain networks with cross-chain compatibility.',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <AccountBalanceIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            xRWA Platform
          </Typography>
          <Button color="inherit" onClick={() => router.push('/login')}>
            Login
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="h2" component="h1" gutterBottom>
              Real World Asset Tokenization
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4 }}>
              Transform traditional assets into digital tokens with full regulatory compliance
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/login')}
                sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                Learn More
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Platform Features
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Comprehensive RWA tokenization platform with enterprise-grade security and compliance
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="h3" component="h2" gutterBottom>
              Ready to Tokenize Your Assets?
            </Typography>
            <Typography variant="h6" component="h3" gutterBottom sx={{ mb: 4 }}>
              Join the future of asset tokenization with our secure, compliant platform
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/login')}
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
            >
              Start Your Journey
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.100', py: 4 }}>
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
              xRWA Platform
            </Typography>
            <Typography variant="body2" color="text.secondary">
              © 2024 xRWA Platform. All rights reserved.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Built with DS Token protocol for regulatory compliance and security.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}