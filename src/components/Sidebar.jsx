import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  ListSubheader
} from '@mui/material'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import ReceiptIcon from '@mui/icons-material/Receipt'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import TakeoutDiningIcon from '@mui/icons-material/TakeoutDining'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import AllInboxIcon from '@mui/icons-material/AllInbox'

const Sidebar = ({ currentView, onViewChange, onFilterChange }) => {
  const menuItems = [
    { text: 'Pedidos', icon: <ReceiptIcon />, view: 'orders' },
    { text: 'Cardápio', icon: <RestaurantMenuIcon />, view: 'menu' }
  ]

  const filterItems = [
    { text: 'Todos os Pedidos', icon: <AllInboxIcon />, filter: 'all' },
    { text: 'Delivery', icon: <LocalShippingIcon />, filter: 'delivery' },
    { text: 'Retirada', icon: <TakeoutDiningIcon />, filter: 'pickup' },
    { text: 'Consumo Local', icon: <RestaurantIcon />, filter: 'dinein' }
  ]

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: '#1e293b',
          color: 'white'
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Peça AI</Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => onViewChange(item.view)}
            selected={currentView === item.view}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                }
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      {currentView === 'orders' && (
        <>
          <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />
          <List
            subheader={
              <ListSubheader
                sx={{
                  backgroundColor: 'transparent',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: '30px'
                }}
              >
                Filtrar por Tipo
              </ListSubheader>
            }
          >
            {filterItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => onFilterChange(item.filter)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'white' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Drawer>
  )
}

export default Sidebar