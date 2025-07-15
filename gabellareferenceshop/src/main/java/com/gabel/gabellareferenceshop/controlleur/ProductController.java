package com.gabel.gabellareferenceshop.controlleur;


import com.gabel.gabellareferenceshop.dto.ProductDto;
import com.gabel.gabellareferenceshop.services.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // ✅ Spécifie que cette classe expose une API REST
@RequestMapping("/api/products") // ✅ Préfixe pour tous les endpoints produits
@RequiredArgsConstructor
public class ProductController {



        private final ProductService productService;

        // ✅ Créer un produit (POST /api/products)
        @PostMapping("/creerproduit")
        public ResponseEntity<?> createProduct(@RequestBody ProductDto productDto) {
            try {
                ProductDto savedProduct = productService.createProduct(productDto);
                return ResponseEntity.ok(savedProduct);
            } catch (Exception e) {
                return ResponseEntity.internalServerError()
                        .body("Erreur lors de la création du produit : " + e.getMessage());
            }
        }

        // ✅ Mettre à jour un produit (PUT /api/products/{id})
        @PutMapping("/mettre a jour un produit/{id}")
        public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody ProductDto productDto) {
            try {
                ProductDto updated = productService.updateProduct(id, productDto);
                return ResponseEntity.ok(updated);
            } catch (Exception e) {
                return ResponseEntity.internalServerError()
                        .body("Erreur lors de la mise à jour : " + e.getMessage());
            }
        }

        // ✅ Supprimer un produit (DELETE /api/products/{id})
        @DeleteMapping("/supprimerunproduit/{id}")
        public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
            try {
                productService.deleteProduct(id);
                return ResponseEntity.noContent().build();
            } catch (Exception e) {
                return ResponseEntity.internalServerError()
                        .body("Erreur lors de la suppression : " + e.getMessage());
            }
        }

        // ✅ Obtenir un produit par son ID (GET /api/products/{id})
        @GetMapping("/obtenirunproduitparsonid/{id}")
        public ResponseEntity<?> getProductById(@PathVariable Long id) {
            try {
                ProductDto productDto = productService.getProductById(id);
                return ResponseEntity.ok(productDto);
            } catch (Exception e) {
                return ResponseEntity.status(404).body("Produit non trouvé : " + e.getMessage());
            }
        }

        // ✅ Lister tous les produits (GET /api/products)
        @GetMapping("listertoutlesproduit")
        public ResponseEntity<?> getAllProducts() {
            try {
                List<ProductDto> products = productService.getAllProducts();
                return ResponseEntity.ok(products);
            } catch (Exception e) {
                return ResponseEntity.internalServerError()
                        .body("Erreur lors de la récupération de la liste : " + e.getMessage());
            }
        }
    }


