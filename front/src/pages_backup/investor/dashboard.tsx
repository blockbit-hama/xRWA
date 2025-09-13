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
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Token as TokenIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';

interface PortfolioStats {
  totalValue: number;
  totalTokens: number;
  activeInvestments: number;
  totalInvested: number;
  unrealizedGains: number;
  realizedGains: number;
}

interface TokenHolding {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  balance: number;
  value: number;
  lockedAmount: number;
  unlockedAmount: number;
  lastUpdated: string;
}

interface Investment {
  id: string;
  tokenSymbol: string;
  amount: number;
  tokenAmount: number;
  status: string;
  lockPeriod?: number;
  lockReleaseDate?: string;
  createdAt: string;
}

const InvestorDashboard: React.FC = () => {
  const router = useRouter();
  const [stats, setStats] = useState<PortfolioStats>({
    totalValue: 0,
    totalTokens: 0,
    activeInvestments: 0,
    totalInvested: 0,
    unrealizedGains: 0,
    realizedGains: 0,
  });
  const [tokenHoldings, setTokenHoldings] = useState<TokenHolding[]>([]);
  const [recentInvestments, setRecentInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data - replace with actual API calls
      setStats({
        totalValue: 175000,
        totalTokens: 3,
        activeInvestments: 2,
        totalInvested: 150000,
        unrealizedGains: 25000,
        realizedGains: 5000,
      });

      setTokenHoldings([
        {
          id: '1',
          tokenSymbol: 'RWA-001',
          tokenName: 'Real Estate Token',
          balance: 100000,
          value: 100000,
          lockedAmount: 50000,
          unlockedAmount: 50000,
          lastUpdated: '2024-12-19T10:30:00Z',
        },
        {
          id: '2',
          tokenSymbol: 'RWA-002',
          tokenName: 'Infrastructure Token',
          balance: 50000,
          value: 50000,
          lockedAmount: 25000,
          unlockedAmount: 25000,
          lastUpdated: '2024-12-19T09:15:00Z',
        },
        {
          id: '3',
          tokenSymbol: 'RWA-003',
          tokenName: 'Commodity Token',
          balance: 25000,
          value: 25000,
          lockedAmount: 0,
          unlockedAmount: 25000,
          lastUpdated: '2024-12-19T08:45:00Z',
        },
      ]);

      setRecentInvestments([
        {
          id: '1',
          tokenSymbol: 'RWA-001',
          amount: 100000,
          tokenAmount: 100000,
          status: 'issued',
          lockPeriod: 365,
          lockReleaseDate: '2025-12-19T00:00:00Z',
          createdAt: '2024-12-19T10:30:00Z',
        },
        {
          id: '2',
          tokenSymbol: 'RWA-002',
          amount: 50000,
          tokenAmount: 50000,
          status: 'funded',
          createdAt: '2024-12-18T14:20:00Z',
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
          Investment Portfolio
        </Typography>

        {/* Portfolio Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <AccountBalanceIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{formatCurrency(stats.totalValue)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Value
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
                      Token Types
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
                    <Typography variant="h6">{stats.activeInvestments}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Investments
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
                  <Typography variant="h6" color="success.main" sx={{ mr: 2 }}>
                    +{formatCurrency(stats.unrealizedGains)}
                  </Typography>
                  <Box>
                    <Typography variant="h6">{formatCurrency(stats.unrealizedGains)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Unrealized Gains
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
                  <Typography variant="h6" color="info.main" sx={{ mr: 2 }}>
                    {formatCurrency(stats.realizedGains)}
                  </Typography>
                  <Box>
                    <Typography variant="h6">{formatCurrency(stats.realizedGains)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Realized Gains
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Token Holdings */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6">
                    Token Holdings
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<SendIcon />}
                    onClick={() => router.push('/investor/transfer')}
                  >
                    Transfer Tokens
                  </Button>
                </Box>

                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Token</TableCell>
                        <TableCell>Balance</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell>Locked</TableCell>
                        <TableCell>Available</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tokenHoldings.map((holding) => (
                        <TableRow key={holding.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2">{holding.tokenSymbol}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {holding.tokenName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{formatCurrency(holding.balance)}</TableCell>
                          <TableCell>{formatCurrency(holding.value)}</TableCell>
                          <TableCell>
                            <Chip
                              label={formatCurrency(holding.lockedAmount)}
                              color="warning"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={formatCurrency(holding.unlockedAmount)}
                              color="success"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/investor/tokens/${holding.id}`)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Investment in RWA-001
                    </Typography>
                    <Typography variant="body2">
                      +100,000 tokens issued
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      2 hours ago
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Investment in RWA-002
                    </Typography>
                    <Typography variant="body2">
                      +50,000 tokens funded
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      1 day ago
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Token transfer
                    </Typography>
                    <Typography variant="body2">
                      -5,000 RWA-003 tokens
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      3 days ago
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Investments */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">
                Recent Investments
              </Typography>
              <Button
                variant="outlined"
                onClick={() => router.push('/investor/investments')}
              >
                View All
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Investment ID</TableCell>
                    <TableCell>Token</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Token Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Lock Period</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentInvestments.map((investment) => (
                    <TableRow key={investment.id}>
                      <TableCell>{investment.id}</TableCell>
                      <TableCell>{investment.tokenSymbol}</TableCell>
                      <TableCell>{formatCurrency(investment.amount)}</TableCell>
                      <TableCell>{formatCurrency(investment.tokenAmount)}</TableCell>
                      <TableCell>
                        <Chip
                          label={investment.status.toUpperCase()}
                          color={getStatusColor(investment.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {investment.lockPeriod ? `${investment.lockPeriod} days` : 'N/A'}
                      </TableCell>
                      <TableCell>{formatDate(investment.createdAt)}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/investor/investments/${investment.id}`)}
                        >
                          <ViewIcon />
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

export default InvestorDashboard;