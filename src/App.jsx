import { useState, useEffect } from 'react'
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import OrderManager from './components/OrderManager'
import MenuManager from './components/MenuManager'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import NewOrder from './components/NewOrder'
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
  const [openNewOrder, setOpenNewOrder] = useState(false)
  const [orderFilter, setOrderFilter] = useState('all') // 'all', 'delivery', 'pickup', 'dinein'
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
    analysis: [
      { id: '1', details: 'Pizza Margherita - Mesa 5' },
      { id: '2', details: 'Hambúrguer Duplo - Delivery' }
    ],
    production: [
      { id: '3', details: 'Salada Caesar - Mesa 3' }
    ],
    ready: [
      { id: '4', details: 'Refrigerante 2L - Delivery' }
    ]
  })

  const handleDragEnd = (result) => {
    if (!result.destination) return

    const { source, destination } = result
    const sourceList = [...orders[source.droppableId]]
    const destList = [...orders[destination.droppableId]]
    const [removed] = sourceList.splice(source.index, 1)
    destList.splice(destination.index, 0, removed)

    setOrders({
      ...orders,
      [source.droppableId]: sourceList,
      [destination.droppableId]: destList
    })
  }

  const handleNewOrder = (orderData) => {
    if (orderData) {
      const newOrderId = Date.now().toString()
      const orderDetails = `${orderData.customerName} - ${orderData.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}`
      
      setOrders(prev => ({
        ...prev,
        analysis: [...prev.analysis, { 
          id: newOrderId, 
          details: orderDetails,
          customerName: orderData.customerName,
          deliveryType: orderData.deliveryType,
          items: orderData.items,
          total: orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }]
      }))
    }
    setOpenNewOrder(false)
  }

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories))
  }, [categories])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar currentView={currentView} onViewChange={setCurrentView} onFilterChange={setOrderFilter} />
        <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <TopBar 
            onViewChange={setCurrentView} 
            currentView={currentView}
            onNewOrder={() => setOpenNewOrder(true)}
          />
          {currentView === 'orders' ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <OrderManager orders={orders} onDragEnd={handleDragEnd} filter={orderFilter} />
            </DragDropContext>
          ) : (
            <MenuManager categories={categories} setCategories={setCategories} />
          )}
        </Box>
        <NewOrder 
          open={openNewOrder} 
          onClose={handleNewOrder}
          categories={categories}
        />
      </Box>
    </ThemeProvider>
  )
}

export default App