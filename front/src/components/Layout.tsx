import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Token as TokenIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Determine user type based on current route
  const isIssuer = router.pathname.startsWith('/issuer');
  const isInvestor = router.pathname.startsWith('/investor');

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Implement logout logic
    router.push('/login');
  };

  const getNavigationItems = () => {
    if (isIssuer) {
      return [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/issuer/dashboard' },
        { text: 'Investors', icon: <PeopleIcon />, path: '/issuer/investors' },
        { text: 'Tokens', icon: <TokenIcon />, path: '/issuer/tokens' },
        { text: 'Investments', icon: <TrendingUpIcon />, path: '/issuer/investments' },
        { text: 'Settlement', icon: <AccountBalanceIcon />, path: '/issuer/settlement' },
        { text: 'Settings', icon: <SettingsIcon />, path: '/issuer/settings' },
      ];
    } else if (isInvestor) {
      return [
        { text: 'Portfolio', icon: <DashboardIcon />, path: '/investor/dashboard' },
        { text: 'Investments', icon: <TrendingUpIcon />, path: '/investor/investments' },
        { text: 'Tokens', icon: <TokenIcon />, path: '/investor/tokens' },
        { text: 'Transfer', icon: <AccountBalanceIcon />, path: '/investor/transfer' },
        { text: 'Settings', icon: <SettingsIcon />, path: '/investor/settings' },
      ];
    }
    return [];
  };

  const getPageTitle = () => {
    const path = router.pathname;
    if (path === '/issuer/dashboard') return 'Issuer Dashboard';
    if (path === '/issuer/investors') return 'Investors Management';
    if (path === '/issuer/tokens') return 'Token Management';
    if (path === '/issuer/investments') return 'Investment Management';
    if (path === '/issuer/settlement') return 'Settlement Management';
    if (path === '/investor/dashboard') return 'Investment Portfolio';
    if (path === '/investor/investments') return 'My Investments';
    if (path === '/investor/tokens') return 'My Tokens';
    if (path === '/investor/transfer') return 'Transfer Tokens';
    return 'xRWA Platform';
  };

  const navigationItems = getNavigationItems();

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {getPageTitle()}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {isIssuer ? 'Issuer' : isInvestor ? 'Investor' : 'User'}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
            >
              <MenuItem onClick={() => router.push('/profile')}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={() => router.push('/settings')}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {navigationItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => {
                  router.push(item.path);
                  setDrawerOpen(false);
                }}
                selected={router.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { sm: `calc(100% - 240px)` },
          ml: { sm: '240px' },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;