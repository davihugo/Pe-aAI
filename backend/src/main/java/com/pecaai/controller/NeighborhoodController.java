package com.pecaai.controller;

import com.pecaai.model.Neighborhood;
import com.pecaai.service.NeighborhoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/neighborhoods")
@CrossOrigin(origins = "http://localhost:5173")
public class NeighborhoodController {

    @Autowired
    private NeighborhoodService neighborhoodService;

    @PostMapping
    public ResponseEntity<Neighborhood> createNeighborhood(@RequestBody Neighborhood neighborhood) {
        return ResponseEntity.ok(neighborhoodService.save(neighborhood));
    }

    @GetMapping
    public ResponseEntity<List<Neighborhood>> getAllNeighborhoods() {
        return ResponseEntity.ok(neighborhoodService.findAll());
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<Neighborhood>> getNeighborhoodsByCity(@PathVariable String city) {
        return ResponseEntity.ok(neighborhoodService.findByCity(city));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNeighborhood(@PathVariable Long id) {
        neighborhoodService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Neighborhood> updateNeighborhood(
            @PathVariable Long id,
            @RequestBody Neighborhood neighborhood) {
        neighborhood.setId(id);
        return ResponseEntity.ok(neighborhoodService.save(neighborhood));
    }
}
