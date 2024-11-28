package com.pecaai.controller;

import com.pecaai.model.Category;
import com.pecaai.model.MenuItem;
import com.pecaai.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:5173")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.findAll());
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        return ResponseEntity.ok(categoryService.save(category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{categoryId}/items")
    public ResponseEntity<MenuItem> addItemToCategory(
            @PathVariable Long categoryId,
            @RequestBody MenuItem item) {
        return ResponseEntity.ok(categoryService.addItemToCategory(categoryId, item));
    }

    @DeleteMapping("/{categoryId}/items/{itemId}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable Long categoryId,
            @PathVariable Long itemId) {
        categoryService.deleteItem(categoryId, itemId);
        return ResponseEntity.ok().build();
    }
}
