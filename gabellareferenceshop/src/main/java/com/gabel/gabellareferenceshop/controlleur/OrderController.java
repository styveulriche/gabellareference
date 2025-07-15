package com.gabel.gabellareferenceshop.controlleur;


import com.gabel.gabellareferenceshop.dto.OrderDto;
import com.gabel.gabellareferenceshop.services.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders") // URL de base : /api/orders
@RequiredArgsConstructor
public class OrderController {




        private final OrderService orderService;

        // ✅ Créer une nouvelle commande
        @PostMapping
        public ResponseEntity<?> createOrder(@RequestBody OrderDto orderDto) {
            try {
                OrderDto createdOrder = orderService.createOrder(orderDto);
                return ResponseEntity.ok(createdOrder);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Erreur lors de la création : " + e.getMessage());
            }
        }

        // ✅ Récupérer une commande par sa référence
        @GetMapping("recuperercommande/{reference}")
        public ResponseEntity<?> getOrder(@PathVariable String reference) {
            try {
                OrderDto order = orderService.getOrderByReference(reference);
                return ResponseEntity.ok(order);
            } catch (Exception e) {
                return ResponseEntity.status(404).body("Commande introuvable : " + e.getMessage());
            }
        }

        // ✅ Récupérer toutes les commandes
        @GetMapping
        public ResponseEntity<List<OrderDto>> getAllOrders() {
            List<OrderDto> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        }

        // ✅ Supprimer une commande par sa référence
        @DeleteMapping("supprimercommande/{reference}")
        public ResponseEntity<?> deleteOrder(@PathVariable String reference) {
            try {
                orderService.deleteOrder(reference);
                return ResponseEntity.noContent().build(); // 204 No Content
            } catch (Exception e) {
                return ResponseEntity.status(404).body("Commande non trouvée : " + e.getMessage());
            }
        }
    }


