import { useState, useEffect } from 'react'
import { Box, CssBaseline, ThemeProvider, createTheme, Container } from '@mui/material'
import OrderManager from './components/OrderManager'
import MenuManager from './components/MenuManager'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import NeighborhoodManager from './components/NeighborhoodManager'
import { DragDropContext } from 'react-beautiful-dnd'

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          border: '1px solid #e2e8f0',
        },
      },
    },
  },
})

function App() {
  const [currentView, setCurrentView] = useState('orders')
  const [orderFilter, setOrderFilter] = useState('all')
  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem('categories')
    return savedCategories ? JSON.parse(savedCategories) : [
      {
        id: 1,
        name: 'Burgers',
        items: [
          { id: 1, name: 'X-Burger', price: 18.90, description: 'Pão, hambúrguer, queijo, alface e tomate' },
          { id: 2, name: 'X-Bacon', price: 22.90, description: 'Pão, hambúrguer, bacon, queijo, alface e tomate' },
        ]
      },
      {
        id: 2,
        name: 'Pizzas',
        items: [
          { id: 3, name: 'Margherita', price: 45.90, description: 'Molho de tomate, mussarela e manjericão' },
          { id: 4, name: 'Calabresa', price: 42.90, description: 'Molho de tomate, calabresa e cebola' },
        ]
      }
    ]
  })
  
  const [orders, setOrders] = useState({
    'EM ANÁLISE': [],
    'EM PRODUÇÃO': [],
    'PRONTO': []
  })

  // Carregar pedidos do backend
  const loadOrders = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/orders')
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      const data = await response.json()
      console.log('Pedidos carregados:', data)
      
      // Organizar pedidos por status
      const organizedOrders = {
        'EM ANÁLISE': [],
        'EM PRODUÇÃO': [],
        'PRONTO': []
      }
      
      data.forEach(order => {
        if (order.status && organizedOrders[order.status]) {
          organizedOrders[order.status].push(order)
        } else {
          console.warn('Pedido com status inválido:', order)
        }
      })
      
      console.log('Pedidos organizados:', organizedOrders)
      setOrders(organizedOrders)
    } catch (error) {
      console.error('Error loading orders:', error)
    }
  }

  // Carregar pedidos ao iniciar
  useEffect(() => {
    loadOrders()
  }, [])

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const orderId = result.draggableId;

    try {
      const response = await fetch(`http://localhost:8080/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newStatus: destination.droppableId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Refresh orders after successful update
      // You might want to implement a more optimistic update approach
      window.location.reload();
    } catch (error) {
      console.error('Error updating order status:', error);
      // You might want to show an error message to the user
    }
  };

  const handleStatusChange = async (orderId, currentStatus, newStatus) => {
    try {
      // Atualizar no backend
      const response = await fetch(`http://localhost:8080/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      // Atualizar estado local
      setOrders(prev => {
        const updatedOrders = { ...prev }
        const orderIndex = updatedOrders[currentStatus].findIndex(order => order.id === orderId)
        
        if (orderIndex !== -1) {
          // Remover da lista atual
          const [movedOrder] = updatedOrders[currentStatus].splice(orderIndex, 1)
          
          // Atualizar status e adicionar à nova lista
          movedOrder.status = newStatus
          updatedOrders[newStatus] = [...(updatedOrders[newStatus] || []), movedOrder]
        }
        
        return updatedOrders
      })
    } catch (error) {
      console.error('Error updating order status:', error)
      // Recarregar pedidos em caso de erro
      loadOrders()
    }
  }

  const handleViewChange = (view) => {
    setCurrentView(view)
  }

  const handleFilterChange = (filter) => {
    setOrderFilter(filter)
  }

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories))
  }, [categories])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Sidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          onFilterChange={setOrderFilter}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            pt: 3,
            pb: 1,
            pl: 0
          }}
        >
          <Container maxWidth="lg" sx={{ pl: 3 }}>
            <DragDropContext onDragEnd={handleDragEnd}>
              {currentView === 'orders' && (
                <OrderManager
                  orders={orders}
                  onStatusChange={handleStatusChange}
                  filter={orderFilter}
                  categories={categories}
                />
              )}
              {currentView === 'menu' && (
                <MenuManager
                  categories={categories}
                  setCategories={setCategories}
                />
              )}
              {currentView === 'neighborhoods' && (
                <NeighborhoodManager />
              )}
            </DragDropContext>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App