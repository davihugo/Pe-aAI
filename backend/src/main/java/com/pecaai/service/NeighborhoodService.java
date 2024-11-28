package com.pecaai.service;

import com.pecaai.model.Neighborhood;
import com.pecaai.repository.NeighborhoodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NeighborhoodService {

    @Autowired
    private NeighborhoodRepository neighborhoodRepository;

    public Neighborhood save(Neighborhood neighborhood) {
        return neighborhoodRepository.save(neighborhood);
    }

    public List<Neighborhood> findAll() {
        return neighborhoodRepository.findAll();
    }

    public List<Neighborhood> findByCity(String city) {
        return neighborhoodRepository.findByCity(city);
    }

    public void delete(Long id) {
        neighborhoodRepository.deleteById(id);
    }
}
