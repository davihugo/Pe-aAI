import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Grid,
} from '@mui/material'
import { useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'

const NewOrder = ({ open, onClose, categories }) => {
  const [order, setOrder] = useState({
    customerName: '',
    customerPhone: '',
    paymentMethod: '',
    deliveryType: '',
    items: [],
    total: 0
  })

  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedItem, setSelectedItem] = useState('')
  const [quantity, setQuantity] = useState(1)

  const handleAddItem = () => {
    if (selectedItem) {
      const category = categories.find(cat => cat.id === parseInt(selectedCategory))
      const item = category.items.find(item => item.id === parseInt(selectedItem))
      
      const newItem = {
        id: Date.now(),
        name: item.name,
        price: item.price,
        quantity: quantity,
        total: item.price * quantity
      }

      setOrder(prev => ({
        ...prev,
        items: [...prev.items, newItem],
        total: prev.total + newItem.total
      }))

      // Reset selection
      setSelectedItem('')
      setQuantity(1)
    }
  }

  const handleRemoveItem = (itemId) => {
    const removedItem = order.items.find(item => item.id === itemId)
    setOrder(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
      total: prev.total - removedItem.total
    }))
  }

  const handleSubmit = () => {
    // Validate required fields
    if (!order.customerName || !order.customerPhone || !order.paymentMethod || !order.deliveryType || order.items.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    onClose(order)

    // Reset form
    setOrder({
      customerName: '',
      customerPhone: '',
      paymentMethod: '',
      deliveryType: '',
      items: [],
      total: 0
    })
  }

  return (
    <Dialog open={open} onClose={() => onClose(null)} maxWidth="md" fullWidth>
      <DialogTitle>Novo Pedido</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome do Cliente"
              value={order.customerName}
              onChange={(e) => setOrder({ ...order, customerName: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telefone"
              value={order.customerPhone}
              onChange={(e) => setOrder({ ...order, customerPhone: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Forma de Pagamento</InputLabel>
              <Select
                value={order.paymentMethod}
                onChange={(e) => setOrder({ ...order, paymentMethod: e.target.value })}
                label="Forma de Pagamento"
              >
                <MenuItem value="dinheiro">Dinheiro</MenuItem>
                <MenuItem value="cartao_credito">Cartão de Crédito</MenuItem>
                <MenuItem value="cartao_debito">Cartão de Débito</MenuItem>
                <MenuItem value="pix">PIX</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Tipo de Entrega</InputLabel>
              <Select
                value={order.deliveryType}
                onChange={(e) => setOrder({ ...order, deliveryType: e.target.value })}
                label="Tipo de Entrega"
              >
                <MenuItem value="delivery">Delivery</MenuItem>
                <MenuItem value="retirada">Retirada</MenuItem>
                <MenuItem value="local">Consumo no Local</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Itens do Pedido</Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setSelectedItem('')
                }}
                label="Categoria"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Item</InputLabel>
              <Select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                label="Item"
                disabled={!selectedCategory}
              >
                {selectedCategory && categories
                  .find(cat => cat.id === parseInt(selectedCategory))
                  ?.items.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name} - R$ {item.price.toFixed(2)}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="number"
              label="Qtd"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              disabled={!selectedItem}
              sx={{ height: '56px' }}
            >
              Adicionar
            </Button>
          </Grid>
        </Grid>

        <List sx={{ mt: 2 }}>
          {order.items.map((item) => (
            <Box key={item.id}>
              <ListItem>
                <ListItemText
                  primary={`${item.quantity}x ${item.name}`}
                  secondary={`R$ ${item.total.toFixed(2)}`}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleRemoveItem(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>

        {order.items.length > 0 && (
          <Typography variant="h6" sx={{ mt: 2, textAlign: 'right' }}>
            Total: R$ {order.total.toFixed(2)}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(null)}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Finalizar Pedido
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default NewOrder
