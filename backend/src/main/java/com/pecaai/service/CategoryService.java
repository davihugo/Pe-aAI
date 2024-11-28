package com.pecaai.service;

import com.pecaai.model.Category;
import com.pecaai.model.MenuItem;
import com.pecaai.repository.CategoryRepository;
import com.pecaai.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    public Category save(Category category) {
        return categoryRepository.save(category);
    }

    public void delete(Long id) {
        categoryRepository.deleteById(id);
    }

    @Transactional
    public MenuItem addItemToCategory(Long categoryId, MenuItem item) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        item.setCategory(category);
        MenuItem savedItem = menuItemRepository.save(item);
        category.addItem(savedItem);
        categoryRepository.save(category);
        
        return savedItem;
    }

    @Transactional
    public void deleteItem(Long categoryId, Long itemId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        
        category.removeItem(item);
        menuItemRepository.delete(item);
    }
}
