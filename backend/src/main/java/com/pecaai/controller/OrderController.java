package com.pecaai.controller;

import com.pecaai.model.Order;
import com.pecaai.model.OrderItem;
import com.pecaai.service.OrderService;
import com.pecaai.dto.OrderDTO;
import com.pecaai.dto.OrderItemDTO;
import com.pecaai.dto.UpdateStatusRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {
    RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE
})
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/api/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PostMapping("/api/orders")
    public ResponseEntity<Order> createOrder(@RequestBody OrderDTO orderDTO) {
        try {
            Order order = new Order();
            order.setCustomerName(orderDTO.getCustomerName());
            order.setCustomerPhone(orderDTO.getCustomerPhone());
            order.setPaymentMethod(orderDTO.getPaymentMethod());
            order.setDeliveryType(orderDTO.getDeliveryType());
            order.setStatus("EM ANÁLISE");  
            order.setOrderDate(LocalDateTime.now());
            order.setTotalAmount(orderDTO.getTotalAmount());

            if ("DELIVERY".equals(orderDTO.getDeliveryType())) {
                order.setCep(orderDTO.getCep());
                order.setStreet(orderDTO.getStreet());
                order.setNumber(orderDTO.getNumber());
                order.setComplement(orderDTO.getComplement());
                order.setReference(orderDTO.getReference());
                order.setNeighborhood(orderDTO.getNeighborhood());
                order.setDeliveryFee(orderDTO.getDeliveryFee());
            }

            // Handle order items
            if (orderDTO.getItems() != null && !orderDTO.getItems().isEmpty()) {
                for (OrderItemDTO itemDTO : orderDTO.getItems()) {
                    OrderItem item = new OrderItem();
                    item.setQuantity(itemDTO.getQuantity());
                    item.setPrice(itemDTO.getPrice());
                    item.setDescription(itemDTO.getDescription());
                    order.addItem(item);
                }
            }

            Order savedOrder = orderService.save(order);
            return ResponseEntity.ok(savedOrder);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error creating order: " + e.getMessage());
        }
    }

    @PutMapping("/api/orders/{id}/status")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request) {
        try {
            Order updatedOrder = orderService.updateOrderStatus(id, request.getStatus());
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/api/orders/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/states")
    public ResponseEntity<List<Map<String, Object>>> getStates() {
        List<Map<String, Object>> states = Arrays.asList(
            Map.of("id", "12", "sigla", "AC", "nome", "Acre"),
            Map.of("id", "27", "sigla", "AL", "nome", "Alagoas"),
            Map.of("id", "16", "sigla", "AP", "nome", "Amapá"),
            Map.of("id", "13", "sigla", "AM", "nome", "Amazonas"),
            Map.of("id", "29", "sigla", "BA", "nome", "Bahia"),
            Map.of("id", "23", "sigla", "CE", "nome", "Ceará"),
            Map.of("id", "53", "sigla", "DF", "nome", "Distrito Federal"),
            Map.of("id", "32", "sigla", "ES", "nome", "Espírito Santo"),
            Map.of("id", "52", "sigla", "GO", "nome", "Goiás"),
            Map.of("id", "21", "sigla", "MA", "nome", "Maranhão"),
            Map.of("id", "51", "sigla", "MT", "nome", "Mato Grosso"),
            Map.of("id", "50", "sigla", "MS", "nome", "Mato Grosso do Sul"),
            Map.of("id", "31", "sigla", "MG", "nome", "Minas Gerais"),
            Map.of("id", "15", "sigla", "PA", "nome", "Pará"),
            Map.of("id", "25", "sigla", "PB", "nome", "Paraíba"),
            Map.of("id", "41", "sigla", "PR", "nome", "Paraná"),
            Map.of("id", "26", "sigla", "PE", "nome", "Pernambuco"),
            Map.of("id", "22", "sigla", "PI", "nome", "Piauí"),
            Map.of("id", "33", "sigla", "RJ", "nome", "Rio de Janeiro"),
            Map.of("id", "24", "sigla", "RN", "nome", "Rio Grande do Norte"),
            Map.of("id", "43", "sigla", "RS", "nome", "Rio Grande do Sul"),
            Map.of("id", "11", "sigla", "RO", "nome", "Rondônia"),
            Map.of("id", "14", "sigla", "RR", "nome", "Roraima"),
            Map.of("id", "42", "sigla", "SC", "nome", "Santa Catarina"),
            Map.of("id", "35", "sigla", "SP", "nome", "São Paulo"),
            Map.of("id", "28", "sigla", "SE", "nome", "Sergipe"),
            Map.of("id", "17", "sigla", "TO", "nome", "Tocantins")
        );
        return ResponseEntity.ok(states);
    }

    @GetMapping("/api/cities")
    public ResponseEntity<List<Map<String, Object>>> getCities(@RequestParam String state) {
        List<Map<String, Object>> cities = Arrays.asList(
            Map.of("id", "1", "nome", "São Paulo"),
            Map.of("id", "2", "nome", "Campinas"),
            Map.of("id", "3", "nome", "Santos")
        );
        return ResponseEntity.ok(cities);
    }

    @GetMapping("/api/categories")
    public ResponseEntity<List<Map<String, Object>>> getCategories() {
        List<Map<String, Object>> categories = Arrays.asList(
            Map.of(
                "id", 1,
                "name", "Pizzas",
                "items", Arrays.asList(
                    Map.of("id", 1, "name", "Pizza Margherita", "price", 45.90),
                    Map.of("id", 2, "name", "Pizza Calabresa", "price", 42.90),
                    Map.of("id", 3, "name", "Pizza Portuguesa", "price", 47.90)
                )
            ),
            Map.of(
                "id", 2,
                "name", "Bebidas",
                "items", Arrays.asList(
                    Map.of("id", 4, "name", "Refrigerante 2L", "price", 12.90),
                    Map.of("id", 5, "name", "Suco Natural", "price", 8.90),
                    Map.of("id", 6, "name", "Água Mineral", "price", 4.90)
                )
            )
        );
        return ResponseEntity.ok(categories);
    }

    static class UpdateStatusRequest {
        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
