import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  TextField,
  Box,
  InputAdornment,
  IconButton,
  Avatar,
  Badge,
  ButtonGroup,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import PersonIcon from '@mui/icons-material/Person'
import NotificationsIcon from '@mui/icons-material/Notifications'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import ReceiptIcon from '@mui/icons-material/Receipt'

const TopBar = ({ currentView, onViewChange, onNewOrder }) => {
  return (
    <AppBar 
      position="static" 
      color="inherit" 
      elevation={0} 
      sx={{ 
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'white'
      }}
    >
      <Toolbar sx={{ height: 70 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            flexGrow: 0, 
            fontWeight: 600,
            background: 'linear-gradient(45deg, #2563eb 30%, #60a5fa 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mr: 4
          }}
        >
          Peça AI
        </Typography>

        <ButtonGroup variant="outlined" sx={{ mr: 'auto' }}>
          <Button
            startIcon={<ReceiptIcon />}
            onClick={() => onViewChange('orders')}
            variant={currentView === 'orders' ? 'contained' : 'outlined'}
          >
            Pedidos
          </Button>
          <Button
            startIcon={<RestaurantMenuIcon />}
            onClick={() => onViewChange('menu')}
            variant={currentView === 'menu' ? 'contained' : 'outlined'}
          >
            Cardápio
          </Button>
        </ButtonGroup>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Buscar pedido"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                backgroundColor: '#f8fafc'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onNewOrder}
            sx={{ 
              borderRadius: '20px',
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Novo pedido
          </Button>

          <IconButton color="default" sx={{ ml: 1 }}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Avatar 
            sx={{ 
              bgcolor: 'primary.light',
              width: 35,
              height: 35
            }}
          >
            <PersonIcon />
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default TopBar