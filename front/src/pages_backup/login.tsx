import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Issuer form state
  const [issuerForm, setIssuerForm] = useState({
    email: '',
    password: '',
  });
  
  // Investor form state
  const [investorForm, setInvestorForm] = useState({
    investorId: '',
    password: '',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
  };

  const handleIssuerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Mock login - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful login
      localStorage.setItem('userType', 'issuer');
      localStorage.setItem('userEmail', issuerForm.email);
      router.push('/issuer/dashboard');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleInvestorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Mock login - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful login
      localStorage.setItem('userType', 'investor');
      localStorage.setItem('investorId', investorForm.investorId);
      router.push('/investor/dashboard');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent>
          <Box textAlign="center" sx={{ mb: 3 }}>
            <AccountBalanceIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              xRWA Platform
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Real World Asset Tokenization Platform
            </Typography>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab
                icon={<AccountBalanceIcon />}
                label="Issuer Login"
                iconPosition="start"
              />
              <Tab
                icon={<PersonIcon />}
                label="Investor Login"
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleIssuerLogin}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={issuerForm.email}
                onChange={(e) => setIssuerForm({ ...issuerForm, email: e.target.value })}
                margin="normal"
                required
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={issuerForm.password}
                onChange={(e) => setIssuerForm({ ...issuerForm, password: e.target.value })}
                margin="normal"
                required
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Signing In...' : 'Sign In as Issuer'}
              </Button>
            </form>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <form onSubmit={handleInvestorLogin}>
              <TextField
                fullWidth
                label="Investor ID"
                value={investorForm.investorId}
                onChange={(e) => setInvestorForm({ ...investorForm, investorId: e.target.value })}
                margin="normal"
                required
                disabled={loading}
                placeholder="e.g., INV001"
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={investorForm.password}
                onChange={(e) => setInvestorForm({ ...investorForm, password: e.target.value })}
                margin="normal"
                required
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Signing In...' : 'Sign In as Investor'}
              </Button>
            </form>
          </TabPanel>

          <Box textAlign="center" sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Demo Credentials:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Issuer: issuer@xrwa.com / password123
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Investor: INV001 / password123
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;