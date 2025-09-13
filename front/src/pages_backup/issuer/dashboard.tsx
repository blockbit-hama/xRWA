import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon,
  Token as TokenIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';

interface DashboardStats {
  totalInvestors: number;
  totalTokens: number;
  totalInvestments: number;
  totalVolume: number;
  pendingInvestments: number;
  activeTokens: number;
}

interface RecentInvestment {
  id: string;
  investorId: string;
  amount: number;
  tokenAmount: number;
  status: string;
  createdAt: string;
}

const IssuerDashboard: React.FC = () => {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalInvestors: 0,
    totalTokens: 0,
    totalInvestments: 0,
    totalVolume: 0,
    pendingInvestments: 0,
    activeTokens: 0,
  });
  const [recentInvestments, setRecentInvestments] = useState<RecentInvestment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data - replace with actual API calls
      setStats({
        totalInvestors: 156,
        totalTokens: 3,
        totalInvestments: 89,
        totalVolume: 2500000,
        pendingInvestments: 12,
        activeTokens: 2,
      });

      setRecentInvestments([
        {
          id: '1',
          investorId: 'INV001',
          amount: 50000,
          tokenAmount: 50000,
          status: 'pending',
          createdAt: '2024-12-19T10:30:00Z',
        },
        {
          id: '2',
          investorId: 'INV002',
          amount: 100000,
          tokenAmount: 100000,
          status: 'funded',
          createdAt: '2024-12-19T09:15:00Z',
        },
        {
          id: '3',
          investorId: 'INV003',
          amount: 25000,
          tokenAmount: 25000,
          status: 'issued',
          createdAt: '2024-12-19T08:45:00Z',
        },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'funded':
        return 'info';
      case 'issued':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Loading dashboard...</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Issuer Dashboard
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <PeopleIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{stats.totalInvestors}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Investors
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TokenIcon color="secondary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{stats.totalTokens}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Tokens
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUpIcon color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{stats.totalInvestments}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Investments
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <AccountBalanceIcon color="info" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{formatCurrency(stats.totalVolume)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Volume
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Typography variant="h6" color="warning.main" sx={{ mr: 2 }}>
                    {stats.pendingInvestments}
                  </Typography>
                  <Box>
                    <Typography variant="h6">{stats.pendingInvestments}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Investments
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push('/issuer/investors/new')}
                  >
                    Register New Investor
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => router.push('/issuer/tokens/new')}
                  >
                    Create New Token
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TrendingUpIcon />}
                    onClick={() => router.push('/issuer/investments')}
                  >
                    Manage Investments
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="body2">
                    • New investor INV004 registered
                  </Typography>
                  <Typography variant="body2">
                    • Investment INV-001 funded successfully
                  </Typography>
                  <Typography variant="body2">
                    • Token RWA-001 issued to investor INV002
                  </Typography>
                  <Typography variant="body2">
                    • KYC verification completed for INV003
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Investments Table */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">
                Recent Investments
              </Typography>
              <Button
                variant="outlined"
                onClick={() => router.push('/issuer/investments')}
              >
                View All
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Investment ID</TableCell>
                    <TableCell>Investor</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Token Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentInvestments.map((investment) => (
                    <TableRow key={investment.id}>
                      <TableCell>{investment.id}</TableCell>
                      <TableCell>{investment.investorId}</TableCell>
                      <TableCell>{formatCurrency(investment.amount)}</TableCell>
                      <TableCell>{formatCurrency(investment.tokenAmount)}</TableCell>
                      <TableCell>
                        <Chip
                          label={investment.status.toUpperCase()}
                          color={getStatusColor(investment.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(investment.createdAt)}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/issuer/investments/${investment.id}`)}
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/issuer/investments/${investment.id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

export default IssuerDashboard;