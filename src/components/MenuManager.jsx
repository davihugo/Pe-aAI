import {
  Box,
  Typography,
  Card,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Fab,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material'
import { useState, useEffect } from 'react'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import FastfoodIcon from '@mui/icons-material/Fastfood'

const MenuManager = () => {
  const [categories, setCategories] = useState([])
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false)
  const [openItemDialog, setOpenItemDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [newCategory, setNewCategory] = useState({ name: '' })
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '', categoryId: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch menu categories')
      }
      const data = await response.json()
      setCategories(data)
      setError(null)
    } catch (err) {
      setError('Erro ao carregar o cardápio. Por favor, tente novamente.')
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (newCategory.name.trim()) {
      try {
        const response = await fetch('http://localhost:8080/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCategory)
        })

        if (!response.ok) {
          throw new Error('Failed to add category')
        }

        await fetchCategories()
        setNewCategory({ name: '' })
        setOpenCategoryDialog(false)
      } catch (err) {
        console.error('Error adding category:', err)
        setError('Erro ao adicionar categoria. Por favor, tente novamente.')
      }
    }
  }

  const handleAddItem = async () => {
    if (newItem.name && newItem.price && newItem.categoryId) {
      try {
        const response = await fetch(`http://localhost:8080/api/categories/${newItem.categoryId}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newItem.name,
            price: parseFloat(newItem.price),
            description: newItem.description
          })
        })

        if (!response.ok) {
          throw new Error('Failed to add item')
        }

        await fetchCategories()
        setNewItem({ name: '', price: '', description: '', categoryId: '' })
        setOpenItemDialog(false)
      } catch (err) {
        console.error('Error adding item:', err)
        setError('Erro ao adicionar item. Por favor, tente novamente.')
      }
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete category')
      }

      await fetchCategories()
    } catch (err) {
      console.error('Error deleting category:', err)
      setError('Erro ao excluir categoria. Por favor, tente novamente.')
    }
  }

  const handleDeleteItem = async (categoryId, itemId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/categories/${categoryId}/items/${itemId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete item')
      }

      await fetchCategories()
    } catch (err) {
      console.error('Error deleting item:', err)
      setError('Erro ao excluir item. Por favor, tente novamente.')
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Gerenciador de Cardápio
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCategoryDialog(true)}
          sx={{ borderRadius: '20px' }}
        >
          Nova Categoria
        </Button>
      </Box>

      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} md={6} lg={4} key={category.id}>
            <Card sx={{ height: '100%', p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {category.name}
                </Typography>
                <Box>
                  <IconButton size="small" onClick={() => handleDeleteCategory(category.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <List>
                {category.items?.map((item) => (
                  <Box key={item.id}>
                    <ListItem>
                      <ListItemText
                        primary={item.name}
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {item.description}
                            </Typography>
                            <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                              R$ {item.price.toFixed(2)}
                            </Typography>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" size="small" onClick={() => handleDeleteItem(category.id, item.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </Box>
                ))}
              </List>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setOpenItemDialog(true)}
      >
        <FastfoodIcon />
      </Fab>

      {/* Dialog para adicionar categoria */}
      <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)}>
        <DialogTitle>Nova Categoria</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome da Categoria"
            fullWidth
            variant="outlined"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoryDialog(false)}>Cancelar</Button>
          <Button onClick={handleAddCategory} variant="contained">Adicionar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para adicionar item */}
      <Dialog open={openItemDialog} onClose={() => setOpenItemDialog(false)}>
        <DialogTitle>Novo Item</DialogTitle>
        <DialogContent>
          <TextField
            select
            margin="dense"
            label="Categoria"
            fullWidth
            variant="outlined"
            value={newItem.categoryId}
            onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
            sx={{ mb: 2 }}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Nome do Item"
            fullWidth
            variant="outlined"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Preço"
            fullWidth
            variant="outlined"
            type="number"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Descrição"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenItemDialog(false)}>Cancelar</Button>
          <Button onClick={handleAddItem} variant="contained">Adicionar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MenuManager
