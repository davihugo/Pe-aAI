import { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import InputMask from 'react-input-mask'
import * as yup from 'yup'

const schema = yup.object().shape({
  customerName: yup
    .string()
    .required('Nome do cliente é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  customerPhone: yup
    .string()
    .required('Telefone é obrigatório')
    .matches(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone inválido'),
  paymentMethod: yup
    .string()
    .required('Forma de pagamento é obrigatória'),
  deliveryType: yup
    .string()
    .required('Tipo de entrega é obrigatório'),
  items: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required('Nome do item é obrigatório'),
        quantity: yup
          .number()
          .required('Quantidade é obrigatória')
          .min(1, 'Quantidade mínima é 1')
          .max(100, 'Quantidade máxima é 100'),
        price: yup
          .number()
          .required('Preço é obrigatório')
          .min(0.01, 'Preço mínimo é R$ 0,01')
          .max(10000, 'Preço máximo é R$ 10.000,00')
      })
    )
    .min(1, 'Adicione pelo menos um item')
})

const NewOrder = ({ open, onClose, categories = [], states = [], neighborhoods = [] }) => {
  const [order, setOrder] = useState({
    customerName: '',
    customerPhone: '',
    paymentMethod: '',
    deliveryType: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    reference: '',
    neighborhood: null,
    deliveryFee: 0,
    items: []
  })
  const [errors, setErrors] = useState({})
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedItem, setSelectedItem] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null)

  useEffect(() => {
  }, [])

  const fetchAddressByCep = async (cep) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json()
      if (!data.erro) {
        const neighborhood = neighborhoods.find(n => 
          n.name.toLowerCase() === data.bairro.toLowerCase()
        )
        
        setOrder(prev => ({
          ...prev,
          street: data.logradouro,
          neighborhood: neighborhood,
          deliveryFee: neighborhood ? neighborhood.deliveryFee : 0
        }))
        
        if (neighborhood) {
          setSelectedNeighborhood(neighborhood)
        }
      }
    } catch (error) {
      console.error('Error fetching address:', error)
    }
  }

  const handleCepChange = (e) => {
    const cep = e.target.value.replace(/\D/g, '')
    setOrder(prev => ({ ...prev, cep }))
    
    if (cep.length === 8) {
      fetchAddressByCep(cep)
    }
  }

  const handleAddItem = async () => {
    if (!selectedCategory || !selectedItem) {
      setErrors(prev => ({ ...prev, newItem: 'Selecione uma categoria e um item' }))
      return
    }

    try {
      const category = categories.find(cat => cat.id === parseInt(selectedCategory))
      const item = category.items.find(item => item.id === parseInt(selectedItem))

      const newItem = {
        id: Date.now(),
        name: item.name,
        price: item.price,
        quantity: parseInt(quantity),
        total: item.price * parseInt(quantity)
      }

      setOrder(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }))
      
      setSelectedItem('')
      setQuantity(1)
      setErrors(prev => ({ ...prev, items: undefined, newItem: undefined }))
    } catch (err) {
      setErrors(prev => ({ ...prev, newItem: err.message }))
    }
  }

  const handleRemoveItem = (index) => {
    setOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const calculateTotal = () => {
    return order.items.reduce((total, item) => total + item.total, 0)
  }

  const handleSaveOrder = async (e) => {
    e.preventDefault()
    
    try {
      // Validate required fields
      const errors = {}
      if (!order.customerName) errors.customerName = 'Nome é obrigatório'
      if (!order.customerPhone) errors.customerPhone = 'Telefone é obrigatório'
      if (!order.paymentMethod) errors.paymentMethod = 'Forma de pagamento é obrigatória'
      if (!order.deliveryType) errors.deliveryType = 'Tipo de entrega é obrigatório'
      if (order.deliveryType === 'DELIVERY') {
        if (!order.cep) errors.cep = 'CEP é obrigatório'
        if (!order.street) errors.street = 'Rua é obrigatória'
        if (!order.number) errors.number = 'Número é obrigatório'
        if (!order.neighborhood) errors.neighborhood = 'Bairro é obrigatório'
      }
      if (order.items.length === 0) errors.items = 'Adicione pelo menos um item ao pedido'

      if (Object.keys(errors).length > 0) {
        setErrors(errors)
        return
      }

      const orderData = {
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        paymentMethod: order.paymentMethod,
        deliveryType: order.deliveryType,
        cep: order.cep,
        street: order.street,
        number: order.number,
        complement: order.complement,
        reference: order.reference,
        neighborhood: order.neighborhood,
        deliveryFee: order.deliveryFee,
        items: order.items.map(item => ({
          quantity: item.quantity,
          price: item.price,
          description: `${item.name} - ${item.quantity}x`
        })),
        totalAmount: calculateTotal() + (order.deliveryType === 'DELIVERY' ? order.deliveryFee : 0),
        orderDate: new Date().toISOString(),
        status: 'EM ANÁLISE'
      }

      const response = await fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Server error:', errorData)
        throw new Error('Erro ao salvar pedido')
      }

      const savedOrder = await response.json()
      onClose && onClose(savedOrder)

      // Reset form
      setOrder({
        customerName: '',
        customerPhone: '',
        paymentMethod: '',
        deliveryType: '',
        cep: '',
        street: '',
        number: '',
        complement: '',
        reference: '',
        neighborhood: null,
        deliveryFee: 0,
        items: []
      })
      setSelectedNeighborhood(null)
      setErrors({})
    } catch (err) {
      console.error('Error saving order:', err)
      setErrors(prev => ({ ...prev, submit: err.message }))
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Novo Pedido</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome do Cliente"
                value={order.customerName}
                onChange={(e) => {
                  setOrder(prev => ({ ...prev, customerName: e.target.value }))
                }}
                error={Boolean(errors.customerName)}
                helperText={errors.customerName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InputMask
                mask="(99) 99999-9999"
                value={order.customerPhone}
                onChange={(e) => {
                  setOrder(prev => ({ ...prev, customerPhone: e.target.value }))
                }}
              >
                {(inputProps) => (
                  <TextField
                    {...inputProps}
                    fullWidth
                    label="Telefone"
                    error={Boolean(errors.customerPhone)}
                    helperText={errors.customerPhone}
                  />
                )}
              </InputMask>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={Boolean(errors.paymentMethod)}>
                <InputLabel>Forma de Pagamento</InputLabel>
                <Select
                  value={order.paymentMethod}
                  onChange={(e) => {
                    setOrder(prev => ({ ...prev, paymentMethod: e.target.value }))
                  }}
                  label="Forma de Pagamento"
                >
                  <MenuItem value="DINHEIRO">Dinheiro</MenuItem>
                  <MenuItem value="CARTAO">Cartão</MenuItem>
                  <MenuItem value="PIX">PIX</MenuItem>
                </Select>
                {errors.paymentMethod && (
                  <FormHelperText>{errors.paymentMethod}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={Boolean(errors.deliveryType)}>
                <InputLabel>Tipo de Entrega</InputLabel>
                <Select
                  value={order.deliveryType}
                  onChange={(e) => {
                    const value = e.target.value
                    setOrder(prev => ({ 
                      ...prev, 
                      deliveryType: value,
                      cep: '',
                      street: '',
                      number: '',
                      complement: '',
                      reference: '',
                      neighborhood: null,
                      deliveryFee: 0
                    }))
                  }}
                  label="Tipo de Entrega"
                >
                  <MenuItem value="DELIVERY">Delivery</MenuItem>
                  <MenuItem value="RETIRADA">Retirada</MenuItem>
                </Select>
                {errors.deliveryType && (
                  <FormHelperText>{errors.deliveryType}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            {order.deliveryType === 'DELIVERY' && (
              <>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="CEP"
                    value={order.cep}
                    onChange={handleCepChange}
                    InputProps={{
                      inputComponent: InputMask,
                      inputProps: {
                        mask: '99999-999'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={Boolean(errors.neighborhood)}>
                    <InputLabel>Bairro</InputLabel>
                    <Select
                      value={selectedNeighborhood ? selectedNeighborhood.id : ''}
                      onChange={(e) => {
                        const neighborhood = neighborhoods.find(n => n.id === e.target.value)
                        setSelectedNeighborhood(neighborhood)
                        setOrder(prev => ({
                          ...prev,
                          neighborhood: neighborhood,
                          deliveryFee: neighborhood ? neighborhood.deliveryFee : 0
                        }))
                      }}
                      label="Bairro"
                    >
                      {Array.isArray(neighborhoods) && 
                        neighborhoods.map((neighborhood) => (
                          <MenuItem key={neighborhood.id} value={neighborhood.id}>
                            {neighborhood.name} - R$ {neighborhood.deliveryFee.toFixed(2)}
                          </MenuItem>
                        ))}
                    </Select>
                    {errors.neighborhood && (
                      <FormHelperText>{errors.neighborhood}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Rua/Avenida"
                    value={order.street}
                    onChange={(e) => setOrder(prev => ({ ...prev, street: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Número"
                    value={order.number}
                    onChange={(e) => setOrder(prev => ({ ...prev, number: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Complemento"
                    value={order.complement}
                    onChange={(e) => setOrder(prev => ({ ...prev, complement: e.target.value }))}
                    placeholder="Apto, Bloco, etc."
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ponto de Referência"
                    value={order.reference}
                    onChange={(e) => setOrder(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="Próximo a..."
                  />
                </Grid>
              </>
            )}
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Adicionar Item
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth error={Boolean(errors.newItem)}>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={selectedCategory || ''}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value)
                      setSelectedItem('')
                    }}
                    label="Categoria"
                  >
                    {Array.isArray(categories) && categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.newItem && (
                    <FormHelperText>{errors.newItem}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Item</InputLabel>
                  <Select
                    value={selectedItem || ''}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    label="Item"
                    disabled={!selectedCategory}
                  >
                    {Array.isArray(categories) && selectedCategory && 
                      categories
                        .find(cat => cat.id === selectedCategory)?.items
                        .map((item) => (
                          <MenuItem
                            key={item.id}
                            value={item.id}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              width: '100%'
                            }}
                          >
                            <span>{item.name}</span>
                            <span>R$ {item.price.toFixed(2)}</span>
                          </MenuItem>
                        ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quantidade"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  InputProps={{ inputProps: { min: 1, max: 100 } }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleAddItem}
                  startIcon={<AddIcon />}
                  disabled={!selectedCategory || !selectedItem}
                >
                  Adicionar
                </Button>
              </Grid>
            </Grid>
            {errors.newItem && (
              <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                {errors.newItem}
              </Typography>
            )}
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Itens do Pedido
            </Typography>
            {errors.items && (
              <Typography color="error" variant="caption" sx={{ mb: 2, display: 'block' }}>
                {errors.items}
              </Typography>
            )}
            <List>
              {order.items.map((item, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={item.name}
                    secondary={`${item.quantity}x R$ ${item.price.toFixed(2)} = R$ ${item.total.toFixed(2)}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleRemoveItem(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Typography variant="h6" align="right" sx={{ mt: 2 }}>
              Subtotal: R$ {calculateTotal().toFixed(2)}
              {order.deliveryType === 'DELIVERY' && order.deliveryFee > 0 && (
                <>
                  <br />
                  Taxa de Entrega: R$ {order.deliveryFee.toFixed(2)}
                  <br />
                  Total com Entrega: R$ {(calculateTotal() + order.deliveryFee).toFixed(2)}
                </>
              )}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSaveOrder}
          disabled={
            order.items.length === 0 ||
            !order.customerName ||
            !order.customerPhone ||
            !order.paymentMethod ||
            !order.deliveryType ||
            (order.deliveryType === 'DELIVERY' && (!order.cep || !order.street || !order.number || !selectedNeighborhood))
          }
        >
          Finalizar Pedido
        </Button>
      </DialogActions>
      {errors.submit && (
        <Typography color="error" align="center" sx={{ mb: 2 }}>
          {errors.submit}
        </Typography>
      )}
    </Dialog>
  )
}

export default NewOrder
