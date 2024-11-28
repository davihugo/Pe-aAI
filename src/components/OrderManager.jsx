import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Badge,
  Avatar,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NewOrder from './NewOrder';

const statusColors = {
  'EM ANÁLISE': {
    bg: '#EBF3FE',
    border: '#2563eb',
    chip: 'primary',
    lightBg: '#F5F9FF'
  },
  'EM PRODUÇÃO': {
    bg: '#FFF7ED',
    border: '#EA580C',
    chip: 'warning',
    lightBg: '#FFFAF5'
  },
  'PRONTO': {
    bg: '#F0FDF4',
    border: '#16A34A',
    chip: 'success',
    lightBg: '#F7FDF9'
  }
};

const deliveryTypeColors = {
  'LOCAL': {
    bg: '#f50a1b',
    border: '#E11D48',
    chip: 'error',
    text: '#BE123C',
    icon: '#E11D48'
  },
  'DELIVERY': {
    bg: '#098f2c',
    border: '#0284C7',
    chip: 'info',
    text: '#0369A1',
    icon: '#0284C7'
  }
};

const statusIcons = {
  'EM ANÁLISE': <AccessTimeIcon color="primary" />,
  'EM PRODUÇÃO': <LocalShippingIcon sx={{ color: '#EA580C' }} />,
  'PRONTO': <CheckCircleIcon sx={{ color: '#16A34A' }} />
};

const statusLabels = {
  'EM ANÁLISE': 'Em Análise',
  'EM PRODUÇÃO': 'Em Produção',
  'PRONTO': 'Pronto'
}

const StatusArrows = ({ currentStatus, onStatusChange, orderId }) => {
  const renderArrow = (direction, newStatus, tooltip) => {
    return (
      <Tooltip title={tooltip}>
        <IconButton
          size="small"
          onClick={() => onStatusChange(orderId, newStatus)}
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
    case 'EM ANÁLISE':
      return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          {renderArrow('forward', 'EM PRODUÇÃO', 'Mover para Produção')}
        </Box>
      )
    case 'EM PRODUÇÃO':
      return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          {renderArrow('back', 'EM ANÁLISE', 'Voltar para Análise')}
          {renderArrow('forward', 'PRONTO', 'Mover para Pronto')}
        </Box>
      )
    case 'PRONTO':
      return (
        <Box sx={{ display: 'flex', mt: 1 }}>
          {renderArrow('back', 'EM PRODUÇÃO', 'Voltar para Produção')}
        </Box>
      )
    default:
      return null
  }
}

const OrderColumn = ({ title, orders, status, onStatusChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [neighborhoods, setNeighborhoods] = useState([]);

  useEffect(() => {
    fetchNeighborhoods();
  }, []);

  const fetchNeighborhoods = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/neighborhoods');
      if (!response.ok) {
        throw new Error('Failed to fetch neighborhoods');
      }
      const data = await response.json();
      setNeighborhoods(data);
    } catch (error) {
      console.error('Error fetching neighborhoods:', error);
    }
  };

  const handleOpenMenu = (event, order) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleOpenEditDialog = (order) => {
    setEditingOrder({
      ...order,
      customerName: order.customerName || '',
      customerPhone: order.customerPhone || '',
      street: order.street || '',
      number: order.number || '',
      complement: order.complement || '',
      reference: order.reference || '',
      cep: order.cep || '',
      neighborhood: order.neighborhood || null,
      deliveryType: order.deliveryType || 'LOCAL',
      items: order.items?.map(item => ({
        ...item,
        name: item.description?.split(' - ')[0] || item.name || '',
        quantity: item.quantity || 1,
        price: item.price || 0
      })) || []
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingOrder(null);
  };

  const handleSaveOrder = async () => {
    try {
      const orderData = {
        ...editingOrder,
        items: editingOrder.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          description: `${item.name} - ${item.quantity}x`
        }))
      };

      const response = await fetch(`http://localhost:8080/api/orders/${editingOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      handleCloseEditDialog();
      window.location.reload();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Erro ao atualizar o pedido. Por favor, tente novamente.');
    }
  };

  const handleUpdateOrderItem = (index, field, value) => {
    setEditingOrder(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
      
      // Recalculate total amount
      const totalAmount = updatedItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);

      return {
        ...prev,
        items: updatedItems,
        totalAmount: totalAmount
      };
    });
  };

  return (
    <Grid item xs={12} md={4}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          height: '100%',
          minHeight: '70vh',
          backgroundColor: statusColors[status]?.bg || '#fff',
          borderRadius: 3,
          border: `1px solid ${statusColors[status]?.border}20`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: statusColors[status]?.border,
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {statusIcons[status]}
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
            {title}
          </Typography>
          <Badge 
            badgeContent={orders.length} 
            color={statusColors[status]?.chip}
            sx={{ ml: 2 }}
          />
        </Box>
        
        <Droppable droppableId={status}>
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{ minHeight: 100 }}
            >
              {orders.map((order, index) => (
                <Draggable
                  key={order.id}
                  draggableId={order.id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      elevation={snapshot.isDragging ? 8 : 1}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        backgroundColor: statusColors[status]?.lightBg,
                        borderLeft: '4px solid',
                        borderLeftColor: statusColors[status]?.border,
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '8px',
                          height: '100%',
                          borderTopRightRadius: '8px',
                          borderBottomRightRadius: '8px',
                          backgroundColor: deliveryTypeColors[order.deliveryType || 'LOCAL']?.border || '#E11D48',
                          opacity: 0.7
                        }
                      }}
                    >
                      <Box 
                        onClick={() => handleOpenEditDialog(order)}
                        sx={{ mb: 2 }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                              Pedido #{order.id}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Box>
                                <Typography variant="h6" sx={{ mb: 0.5 }}>
                                  {order.customerName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {order.customerPhone}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                  <Chip
                                    size="small"
                                    label={order.deliveryType === 'DELIVERY' ? 'Delivery' : 'Retirada'}
                                    sx={{
                                      backgroundColor: deliveryTypeColors[order.deliveryType || 'LOCAL']?.bg || '#f50a1b',
                                      color: 'white',
                                      borderRadius: '4px',
                                      '& .MuiChip-label': {
                                        fontWeight: 600
                                      }
                                    }}
                                  />
                                  <Chip
                                    size="small"
                                    label={statusLabels[status]}
                                    color={statusColors[status]?.chip}
                                    sx={{ borderRadius: '4px' }}
                                  />
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(order.orderDate).toLocaleString()}
                                </Typography>
                              </Box>
                            </Box>
                            {order.deliveryType === 'DELIVERY' && (
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                <LocationOnIcon sx={{ fontSize: 16, mr: 0.5, mt: 0.5, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                                  {`${order.street}, ${order.number}`}
                                  {order.complement && ` - ${order.complement}`}
                                  {order.reference && <span style={{ display: 'block' }}>{`Ref: ${order.reference}`}</span>}
                                  {order.neighborhood && order.neighborhood.name && 
                                    <span style={{ display: 'block' }}>{`${order.neighborhood.name}`}</span>
                                  }
                                </Typography>
                              </Box>
                            )}
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                              <Chip
                                icon={<AttachMoneyIcon />}
                                label={`R$ ${order.totalAmount.toFixed(2)}`}
                                size="small"
                                color={statusColors[status]?.chip || 'default'}
                                sx={{ fontWeight: 600 }}
                              />
                              {order.items?.length > 0 && (
                                <Chip
                                  label={`${order.items.length} ${order.items.length === 1 ? 'item' : 'items'}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleOpenMenu(e, order)}
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: `${statusColors[status]?.border}20` 
                              } 
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      <Box 
                        {...provided.dragHandleProps}
                        sx={{ 
                          borderTop: '1px solid',
                          borderColor: 'divider',
                          pt: 2,
                          cursor: 'grab'
                        }}
                      >
                        <StatusArrows currentStatus={status} onStatusChange={onStatusChange} orderId={order.id} />
                      </Box>
                    </Paper>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          PaperProps={{
            elevation: 3,
            sx: {
              borderRadius: 2,
              minWidth: 180
            }
          }}
        >
          {Object.keys(statusColors).map((statusKey) => (
            <MenuItem
              key={statusKey}
              onClick={() => {
                onStatusChange(selectedOrder?.id, statusKey);
                handleCloseMenu();
              }}
              disabled={statusKey === status}
              sx={{
                py: 1.5,
                px: 2,
                '&:hover': {
                  backgroundColor: statusColors[statusKey]?.bg
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {statusIcons[statusKey]}
                <Typography sx={{ ml: 1 }}>
                  Mover para {statusKey}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>

        <Dialog 
          open={editDialogOpen} 
          onClose={handleCloseEditDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            Editar Pedido #{editingOrder?.id}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nome do Cliente"
                    value={editingOrder?.customerName || ''}
                    onChange={(e) => setEditingOrder(prev => ({ ...prev, customerName: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    value={editingOrder?.customerPhone || ''}
                    onChange={(e) => setEditingOrder(prev => ({ ...prev, customerPhone: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Entrega</InputLabel>
                    <Select
                      value={editingOrder?.deliveryType || 'LOCAL'}
                      label="Tipo de Entrega"
                      onChange={(e) => setEditingOrder(prev => ({ ...prev, deliveryType: e.target.value }))}
                    >
                      <MenuItem value="LOCAL">Retirar no Local</MenuItem>
                      <MenuItem value="DELIVERY">Delivery</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {editingOrder?.deliveryType === 'DELIVERY' && (
                  <>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="CEP"
                        value={editingOrder?.cep || ''}
                        onChange={(e) => setEditingOrder(prev => ({ ...prev, cep: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <FormControl fullWidth>
                        <InputLabel>Bairro</InputLabel>
                        <Select
                          value={editingOrder?.neighborhood?.id || ''}
                          label="Bairro"
                          onChange={(e) => {
                            const selectedNeighborhood = neighborhoods.find(n => n.id === e.target.value);
                            setEditingOrder(prev => ({ 
                              ...prev, 
                              neighborhood: selectedNeighborhood,
                              deliveryFee: selectedNeighborhood?.deliveryFee || 0
                            }));
                          }}
                        >
                          {neighborhoods.map((neighborhood) => (
                            <MenuItem key={neighborhood.id} value={neighborhood.id}>
                              {neighborhood.name} - R$ {neighborhood.deliveryFee?.toFixed(2)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={9}>
                      <TextField
                        fullWidth
                        label="Rua"
                        value={editingOrder?.street || ''}
                        onChange={(e) => setEditingOrder(prev => ({ ...prev, street: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Número"
                        value={editingOrder?.number || ''}
                        onChange={(e) => setEditingOrder(prev => ({ ...prev, number: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Complemento"
                        value={editingOrder?.complement || ''}
                        onChange={(e) => setEditingOrder(prev => ({ ...prev, complement: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Ponto de Referência"
                        value={editingOrder?.reference || ''}
                        onChange={(e) => setEditingOrder(prev => ({ ...prev, reference: e.target.value }))}
                      />
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                    Itens do Pedido
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell align="right">Quantidade</TableCell>
                          <TableCell align="right">Preço Unit.</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {editingOrder?.items?.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell align="right">
                              <TextField
                                type="number"
                                size="small"
                                value={item.quantity}
                                onChange={(e) => handleUpdateOrderItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                inputProps={{ min: 1 }}
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              R$ {item.price.toFixed(2)}
                            </TableCell>
                            <TableCell align="right">
                              R$ {(item.price * item.quantity).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={2} />
                          <TableCell align="right">
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              Taxa de Entrega:
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              R$ {editingOrder?.deliveryFee?.toFixed(2) || '0.00'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={2} />
                          <TableCell align="right">
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              Total:
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              R$ {(editingOrder?.totalAmount || 0).toFixed(2)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseEditDialog} variant="outlined" color="inherit">
              Cancelar
            </Button>
            <Button onClick={handleSaveOrder} variant="contained" color="primary">
              Salvar Alterações
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Grid>
  );
};

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchCategories();
    fetchNeighborhoods();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/orders')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchNeighborhoods = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/neighborhoods')
      const data = await response.json()
      setNeighborhoods(data)
    } catch (error) {
      console.error('Error fetching neighborhoods:', error)
    }
  }

  const handleNewOrderClose = () => {
    setNewOrderOpen(false)
    fetchOrders() // Atualiza a lista de pedidos após criar um novo
  }

  const getPendingOrders = () => orders.filter(order => order.status === 'EM ANÁLISE')
  const getInProgressOrders = () => orders.filter(order => order.status === 'EM PRODUÇÃO')
  const getCompletedOrders = () => orders.filter(order => order.status === 'PRONTO')

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8080/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server error:', errorData);
        throw new Error(`Failed to update order status: ${errorData}`);
      }

      // Fetch fresh data after status update
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Erro ao atualizar o status do pedido. Por favor, tente novamente.');
    }
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#F8FAFC' }}>
      <Box 
        sx={{ 
          mb: 4, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: 'white',
          p: 3,
          borderRadius: 3,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B' }}>
          Gerenciamento de Pedidos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setNewOrderOpen(true)}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4
            }
          }}
        >
          Novo Pedido
        </Button>
      </Box>

      <Grid container spacing={3}>
        <OrderColumn
          title="Em Análise"
          orders={getPendingOrders()}
          status="EM ANÁLISE"
          onStatusChange={handleStatusChange}
        />
        <OrderColumn
          title="Em Produção"
          orders={getInProgressOrders()}
          status="EM PRODUÇÃO"
          onStatusChange={handleStatusChange}
        />
        <OrderColumn
          title="Pronto"
          orders={getCompletedOrders()}
          status="PRONTO"
          onStatusChange={handleStatusChange}
        />
      </Grid>

      <NewOrder
        open={newOrderOpen}
        onClose={handleNewOrderClose}
        categories={categories}
        neighborhoods={neighborhoods}
      />
    </Box>
  );
};

export default OrderManager;