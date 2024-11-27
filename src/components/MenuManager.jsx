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
} from '@mui/material'
import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import FastfoodIcon from '@mui/icons-material/Fastfood'

const initialCategories = [
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

const MenuManager = ({ categories, setCategories }) => {
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false)
  const [openItemDialog, setOpenItemDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [newCategory, setNewCategory] = useState({ name: '' })
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '', categoryId: '' })

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      const newCategoryObj = {
        id: Date.now(),
        name: newCategory.name,
        items: []
      }
      setCategories([...categories, newCategoryObj])
      setNewCategory({ name: '' })
      setOpenCategoryDialog(false)
    }
  }

  const handleAddItem = () => {
    if (newItem.name && newItem.price && newItem.categoryId) {
      const updatedCategories = categories.map(category => {
        if (category.id === parseInt(newItem.categoryId)) {
          return {
            ...category,
            items: [...category.items, {
              id: Date.now(),
              name: newItem.name,
              price: parseFloat(newItem.price),
              description: newItem.description
            }]
          }
        }
        return category
      })
      setCategories(updatedCategories)
      setNewItem({ name: '', price: '', description: '', categoryId: '' })
      setOpenItemDialog(false)
    }
  }

  const handleDeleteCategory = (categoryId) => {
    setCategories(categories.filter(category => category.id !== categoryId))
  }

  const handleDeleteItem = (categoryId, itemId) => {
    const updatedCategories = categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          items: category.items.filter(item => item.id !== itemId)
        }
      }
      return category
    })
    setCategories(updatedCategories)
  }

  return (
    <Box sx={{ p: 3 }}>
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
                {category.items.map((item) => (
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
          />
          <TextField
            margin="dense"
            label="Preço"
            fullWidth
            variant="outlined"
            type="number"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
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
