import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Box, Paper, Typography, IconButton, Menu, MenuItem, Chip, Tooltip } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useState } from 'react'

const statusColors = {
  analysis: {
    bg: '#eff6ff',
    border: '#2563eb',
    chip: 'primary'
  },
  production: {
    bg: '#fff7ed',
    border: '#ea580c',
    chip: 'warning'
  },
  ready: {
    bg: '#f0fdf4',
    border: '#16a34a',
    chip: 'success'
  }
}

const statusLabels = {
  analysis: 'Em Análise',
  production: 'Em Produção',
  ready: 'Pronto'
}

const StatusArrows = ({ currentStatus, onStatusChange, orderId }) => {
  const renderArrow = (direction, newStatus, tooltip) => {
    return (
      <Tooltip title={tooltip}>
        <IconButton
          size="small"
          onClick={() => onStatusChange(orderId, currentStatus, newStatus)}
          sx={{
            backgroundColor: 'white',
            '&:hover': {
              backgroundColor: '#f5f5f5'
            },
            boxShadow: 1,
            mr: direction === 'forward' ? 0 : 1
          }}
        >
          {direction === 'forward' ? <ArrowForwardIcon /> : <ArrowBackIcon />}
        </IconButton>
      </Tooltip>
    )
  }

  switch (currentStatus) {
    case 'analysis':
      return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          {renderArrow('forward', 'production', 'Mover para Produção')}
        </Box>
      )
    case 'production':
      return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          {renderArrow('back', 'analysis', 'Voltar para Análise')}
          {renderArrow('forward', 'ready', 'Mover para Pronto')}
        </Box>
      )
    case 'ready':
      return (
        <Box sx={{ display: 'flex', mt: 1 }}>
          {renderArrow('back', 'production', 'Voltar para Produção')}
        </Box>
      )
    default:
      return null
  }
}

const OrderColumn = ({ title, orders, id, onStatusChange }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const handleOpenMenu = (event, order) => {
    setAnchorEl(event.currentTarget)
    setSelectedOrder(order)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setSelectedOrder(null)
  }

  const handleStatusChange = (newStatus) => {
    if (selectedOrder) {
      onStatusChange(selectedOrder.id, id, newStatus)
      handleCloseMenu()
    }
  }

  return (
    <Droppable droppableId={id}>
      {(provided, snapshot) => (
        <Paper
          {...provided.droppableProps}
          ref={provided.innerRef}
          sx={{
            backgroundColor: statusColors[id].bg,
            borderTop: `3px solid ${statusColors[id].border}`,
            minHeight: 500,
            p: 2,
            flex: 1,
            mx: 1,
            overflowY: 'auto',
            transition: 'all 0.2s ease',
            boxShadow: snapshot.isDraggingOver ? 3 : 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Chip
              label={orders?.length || 0}
              color={statusColors[id].chip}
              size="small"
              sx={{ ml: 1 }}
            />
          </Box>

          {orders?.map((order, index) => (
            <Draggable key={order.id} draggableId={order.id} index={index}>
              {(provided, snapshot) => (
                <Paper
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  sx={{
                    p: 2,
                    mb: 2,
                    backgroundColor: 'white',
                    transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: 2,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {order.details}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status: {statusLabels[id]}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(e, order)}
                      sx={{ ml: 1 }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <StatusArrows
                    currentStatus={id}
                    onStatusChange={onStatusChange}
                    orderId={order.id}
                  />
                </Paper>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </Paper>
      )}
    </Droppable>
  )
}

const OrderManager = ({ orders, onDragEnd, filter }) => {
  const filterOrders = (ordersList) => {
    if (!filter || filter === 'all') return ordersList
    return ordersList.filter(order => order.deliveryType === filter)
  }

  const handleStatusChange = (orderId, currentStatus, newStatus) => {
    const sourceList = orders[currentStatus]
    const orderIndex = sourceList.findIndex(o => o.id === orderId)
    
    if (orderIndex !== -1) {
      onDragEnd({
        source: {
          droppableId: currentStatus,
          index: orderIndex
        },
        destination: {
          droppableId: newStatus,
          index: orders[newStatus].length
        }
      })
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box sx={{ display: 'flex', mt: 2, gap: 2, height: 'calc(100vh - 120px)', p: 2 }}>
        <OrderColumn
          title="Em análise"
          orders={filterOrders(orders.analysis)}
          id="analysis"
          onStatusChange={handleStatusChange}
        />
        <OrderColumn
          title="Em produção"
          orders={filterOrders(orders.production)}
          id="production"
          onStatusChange={handleStatusChange}
        />
        <OrderColumn
          title="Pronto"
          orders={filterOrders(orders.ready)}
          id="ready"
          onStatusChange={handleStatusChange}
        />
      </Box>
    </DragDropContext>
  )
}

export default OrderManager