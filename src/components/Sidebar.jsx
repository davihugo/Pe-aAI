import { useState } from 'react'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import ListAltIcon from '@mui/icons-material/ListAlt'
import LocationOnIcon from '@mui/icons-material/LocationOn'

const drawerWidth = 280

const Sidebar = ({ currentView, onViewChange, onFilterChange }) => {
  const [open, setOpen] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value)
    onFilterChange(event.target.value)
  }

  const toggleDrawer = () => {
    setOpen(!open)
  }

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={toggleDrawer}
        edge="start"
        sx={{ 
          mr: 2, 
          ...(open && { display: 'none' }),
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        variant="permanent"
        anchor="left"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            borderRight: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          },
        }}
      >
        <Box 
          sx={{ 
            p: 3,
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <RestaurantIcon sx={{ color: '#2563eb', fontSize: 28 }} />
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              color: '#1e293b', 
              fontWeight: 700,
              letterSpacing: '-0.5px'
            }}
          >
            PeçaAI
          </Typography>
        </Box>

        <List sx={{ p: 2 }}>
          {[
            { id: 'orders', label: 'Pedidos', icon: ListAltIcon },
            { id: 'menu', label: 'Cardápio', icon: RestaurantIcon },
            { id: 'neighborhoods', label: 'Bairros', icon: LocationOnIcon }
          ].map(({ id, label, icon: Icon }) => (
            <ListItem key={id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={currentView === id}
                onClick={() => onViewChange(id)}
                sx={{
                  borderRadius: '12px',
                  transition: 'all 0.2s',
                  '&.Mui-selected': {
                    backgroundColor: '#eff6ff',
                    '&:hover': {
                      backgroundColor: '#dbeafe',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <ListItemIcon>
                  <Icon 
                    sx={{ 
                      color: currentView === id ? '#2563eb' : '#64748b',
                      transition: 'color 0.2s'
                    }} 
                  />
                </ListItemIcon>
                <ListItemText 
                  primary={label} 
                  sx={{ 
                    '& .MuiTypography-root': { 
                      color: currentView === id ? '#2563eb' : '#1e293b',
                      fontWeight: currentView === id ? 600 : 500,
                      transition: 'all 0.2s'
                    } 
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {currentView === 'orders' && (
          <Box sx={{ px: 2, mt: 2 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: '#f8fafc',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '12px',
              }}
            >
              <FormControl fullWidth>
                <InputLabel sx={{ 
                  '&.Mui-focused': { 
                    color: '#2563eb' 
                  } 
                }}>
                  Status
                </InputLabel>
                <Select
                  value={selectedStatus}
                  label="Status"
                  onChange={handleStatusChange}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.15)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.25)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2563eb',
                    },
                  }}
                >
                  <MenuItem value="all">Todos os Pedidos</MenuItem>
                  <MenuItem value="EM ANÁLISE">Em Análise</MenuItem>
                  <MenuItem value="EM PRODUÇÃO">Em Produção</MenuItem>
                  <MenuItem value="PRONTO">Pronto</MenuItem>
                </Select>
              </FormControl>
            </Paper>
          </Box>
        )}
      </Drawer>
    </>
  )
}

export default Sidebar