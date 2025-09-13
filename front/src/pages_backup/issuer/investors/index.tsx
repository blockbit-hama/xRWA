import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
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
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import Layout from '../../../components/Layout';

interface Investor {
  id: string;
  investorId: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  status: string;
  kycVerified: boolean;
  accreditedInvestor: boolean;
  createdAt: string;
}

const InvestorsPage: React.FC = () => {
  const router = useRouter();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [filteredInvestors, setFilteredInvestors] = useState<Investor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    fetchInvestors();
  }, []);

  useEffect(() => {
    filterInvestors();
  }, [searchTerm, investors]);

  const fetchInvestors = async () => {
    try {
      // Mock data - replace with actual API call
      const mockInvestors: Investor[] = [
        {
          id: '1',
          investorId: 'INV001',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          country: 'US',
          status: 'approved',
          kycVerified: true,
          accreditedInvestor: true,
          createdAt: '2024-12-15T10:30:00Z',
        },
        {
          id: '2',
          investorId: 'INV002',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          country: 'KR',
          status: 'pending',
          kycVerified: false,
          accreditedInvestor: false,
          createdAt: '2024-12-18T14:20:00Z',
        },
        {
          id: '3',
          investorId: 'INV003',
          firstName: 'Michael',
          lastName: 'Johnson',
          email: 'michael.johnson@example.com',
          country: 'SG',
          status: 'approved',
          kycVerified: true,
          accreditedInvestor: true,
          createdAt: '2024-12-16T09:15:00Z',
        },
      ];

      setInvestors(mockInvestors);
    } catch (error) {
      console.error('Error fetching investors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInvestors = () => {
    const filtered = investors.filter(
      (investor) =>
        investor.investorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investor.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInvestors(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleActionClick = (investor: Investor, action: 'approve' | 'reject') => {
    setSelectedInvestor(investor);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const handleActionConfirm = async () => {
    if (!selectedInvestor || !actionType) return;

    try {
      // API call to update investor status
      console.log(`Updating investor ${selectedInvestor.id} status to ${actionType}`);
      
      // Update local state
      setInvestors(prev => 
        prev.map(investor => 
          investor.id === selectedInvestor.id 
            ? { ...investor, status: actionType === 'approve' ? 'approved' : 'rejected' }
            : investor
        )
      );

      setActionDialogOpen(false);
      setSelectedInvestor(null);
      setActionType(null);
    } catch (error) {
      console.error('Error updating investor status:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Loading investors...</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4">
            Investors Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/issuer/investors/new')}
          >
            Register New Investor
          </Button>
        </Box>

        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">
                All Investors ({filteredInvestors.length})
              </Typography>
              <TextField
                placeholder="Search investors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 300 }}
              />
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Investor ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Country</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>KYC</TableCell>
                    <TableCell>Accredited</TableCell>
                    <TableCell>Registered</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInvestors.map((investor) => (
                    <TableRow key={investor.id}>
                      <TableCell>{investor.investorId}</TableCell>
                      <TableCell>{`${investor.firstName} ${investor.lastName}`}</TableCell>
                      <TableCell>{investor.email}</TableCell>
                      <TableCell>{investor.country}</TableCell>
                      <TableCell>
                        <Chip
                          label={investor.status.toUpperCase()}
                          color={getStatusColor(investor.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={investor.kycVerified ? 'VERIFIED' : 'PENDING'}
                          color={investor.kycVerified ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={investor.accreditedInvestor ? 'YES' : 'NO'}
                          color={investor.accreditedInvestor ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(investor.createdAt)}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/issuer/investors/${investor.id}`)}
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/issuer/investors/${investor.id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                        {investor.status === 'pending' && (
                          <>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleActionClick(investor, 'approve')}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleActionClick(investor, 'reject')}
                            >
                              <CancelIcon />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Action Confirmation Dialog */}
        <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)}>
          <DialogTitle>
            {actionType === 'approve' ? 'Approve Investor' : 'Reject Investor'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to {actionType} investor {selectedInvestor?.investorId}?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleActionConfirm}
              color={actionType === 'approve' ? 'success' : 'error'}
              variant="contained"
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default InvestorsPage;