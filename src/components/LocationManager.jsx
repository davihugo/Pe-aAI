import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import axios from 'axios'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const LocationPicker = ({ position, onPositionChange }) => {
  const map = useMapEvents({
    click(e) {
      onPositionChange(e.latlng)
    },
  })

  return position ? <Marker position={position} /> : null
}

const LocationManager = () => {
  const [neighborhoods, setNeighborhoods] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingNeighborhood, setEditingNeighborhood] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    city: '',
    deliveryFee: '',
    latitude: '',
    longitude: '',
  })
  const [position, setPosition] = useState(null)

  useEffect(() => {
    fetchNeighborhoods()
    fetchStates()
  }, [])

  useEffect(() => {
    if (selectedState) {
      fetchCities(selectedState)
    }
  }, [selectedState])

  const fetchNeighborhoods = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/neighborhoods')
      setNeighborhoods(response.data)
    } catch (error) {
      console.error('Error fetching neighborhoods:', error)
    }
  }

  const fetchStates = async () => {
    try {
      const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      setStates(response.data.sort((a, b) => a.nome.localeCompare(b.nome)))
    } catch (error) {
      console.error('Error fetching states:', error)
    }
  }

  const fetchCities = async (stateId) => {
    try {
      const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios`)
      setCities(response.data.sort((a, b) => a.nome.localeCompare(b.nome)))
    } catch (error) {
      console.error('Error fetching cities:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        latitude: position?.lat || formData.latitude,
        longitude: position?.lng || formData.longitude,
      }

      if (editingNeighborhood) {
        await axios.put(`http://localhost:8080/api/neighborhoods/${editingNeighborhood.id}`, data)
      } else {
        await axios.post('http://localhost:8080/api/neighborhoods', data)
      }

      setOpenDialog(false)
      setEditingNeighborhood(null)
      resetForm()
      fetchNeighborhoods()
    } catch (error) {
      console.error('Error saving neighborhood:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/neighborhoods/${id}`)
      fetchNeighborhoods()
    } catch (error) {
      console.error('Error deleting neighborhood:', error)
    }
  }

  const handleEdit = (neighborhood) => {
    setEditingNeighborhood(neighborhood)
    setFormData({
      name: neighborhood.name,
      state: neighborhood.state,
      city: neighborhood.city,
      deliveryFee: neighborhood.deliveryFee,
      latitude: neighborhood.latitude,
      longitude: neighborhood.longitude,
    })
    setPosition({ lat: neighborhood.latitude, lng: neighborhood.longitude })
    setOpenDialog(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      state: '',
      city: '',
      deliveryFee: '',
      latitude: '',
      longitude: '',
    })
    setPosition(null)
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Gerenciar Bairros</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          Adicionar Bairro
        </Button>
      </Box>

      <List>
        {neighborhoods.map((neighborhood) => (
          <ListItem key={neighborhood.id}>
            <ListItemText
              primary={neighborhood.name}
              secondary={`${neighborhood.city}, ${neighborhood.state} - Taxa: R$ ${neighborhood.deliveryFee}`}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(neighborhood)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(neighborhood.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingNeighborhood ? 'Editar Bairro' : 'Novo Bairro'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nome do Bairro"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.state}
                label="Estado"
                onChange={(e) => {
                  setFormData({ ...formData, state: e.target.value })
                  setSelectedState(e.target.value)
                }}
              >
                {states.map((state) => (
                  <MenuItem key={state.id} value={state.sigla}>
                    {state.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Cidade</InputLabel>
              <Select
                value={formData.city}
                label="Cidade"
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                disabled={!formData.state}
              >
                {cities.map((city) => (
                  <MenuItem key={city.id} value={city.nome}>
                    {city.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Taxa de Entrega"
              type="number"
              value={formData.deliveryFee}
              onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
              margin="normal"
              required
              InputProps={{
                startAdornment: 'R$ ',
              }}
            />

            <Box sx={{ mt: 2, height: 400 }}>
              <MapContainer
                center={[-23.5505, -46.6333]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationPicker position={position} onPositionChange={setPosition} />
              </MapContainer>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default LocationManager
