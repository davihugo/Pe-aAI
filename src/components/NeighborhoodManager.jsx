import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Grid
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
    },
  })

  return position ? (
    <Marker position={position}>
      <Popup>Localização selecionada</Popup>
    </Marker>
  ) : null
}

const NeighborhoodManager = () => {
  const [neighborhoods, setNeighborhoods] = useState([])
  const [open, setOpen] = useState(false)
  const [editingNeighborhood, setEditingNeighborhood] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    city: '',
    deliveryFee: '',
    latitude: null,
    longitude: null
  })
  const [position, setPosition] = useState(null)

  useEffect(() => {
    fetchNeighborhoods()
  }, [])

  const fetchNeighborhoods = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/neighborhoods')
      const data = await response.json()
      setNeighborhoods(data)
    } catch (error) {
      console.error('Error fetching neighborhoods:', error)
    }
  }

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingNeighborhood(null)
    setFormData({
      name: '',
      state: '',
      city: '',
      deliveryFee: '',
      latitude: null,
      longitude: null
    })
    setPosition(null)
  }

  const handleEdit = (neighborhood) => {
    setEditingNeighborhood(neighborhood)
    setFormData({
      name: neighborhood.name,
      state: neighborhood.state,
      city: neighborhood.city,
      deliveryFee: neighborhood.deliveryFee.toString(),
      latitude: neighborhood.latitude,
      longitude: neighborhood.longitude
    })
    if (neighborhood.latitude && neighborhood.longitude) {
      setPosition([neighborhood.latitude, neighborhood.longitude])
    }
    setOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/neighborhoods/${id}`, {
        method: 'DELETE'
      })
      fetchNeighborhoods()
    } catch (error) {
      console.error('Error deleting neighborhood:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const neighborhoodData = {
      ...formData,
      deliveryFee: parseFloat(formData.deliveryFee),
      latitude: position ? position[0] : null,
      longitude: position ? position[1] : null
    }

    try {
      const url = editingNeighborhood
        ? `http://localhost:8080/api/neighborhoods/${editingNeighborhood.id}`
        : 'http://localhost:8080/api/neighborhoods'
      
      const response = await fetch(url, {
        method: editingNeighborhood ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(neighborhoodData)
      })

      if (response.ok) {
        handleClose()
        fetchNeighborhoods()
      }
    } catch (error) {
      console.error('Error saving neighborhood:', error)
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Gerenciar Bairros e Taxas</Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Novo Bairro
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Bairro</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Cidade</TableCell>
              <TableCell>Taxa de Entrega</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {neighborhoods.map((neighborhood) => (
              <TableRow key={neighborhood.id}>
                <TableCell>{neighborhood.name}</TableCell>
                <TableCell>{neighborhood.state}</TableCell>
                <TableCell>{neighborhood.city}</TableCell>
                <TableCell>R$ {neighborhood.deliveryFee.toFixed(2)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(neighborhood)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(neighborhood.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingNeighborhood ? 'Editar Bairro' : 'Novo Bairro'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome do Bairro"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Estado"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cidade"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Taxa de Entrega"
                name="deliveryFee"
                type="number"
                value={formData.deliveryFee}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: 'R$'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Selecione a localização no mapa (opcional)
              </Typography>
              <Box sx={{ height: 400, width: '100%', mt: 2 }}>
                <MapContainer
                  center={[-23.5505, -46.6333]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default NeighborhoodManager
