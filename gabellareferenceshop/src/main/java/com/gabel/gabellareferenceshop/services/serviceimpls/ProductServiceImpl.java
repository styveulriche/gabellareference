package com.gabel.gabellareferenceshop.services.serviceimpls;


import com.gabel.gabellareferenceshop.dto.ProductDto;
import com.gabel.gabellareferenceshop.exception.ResourceNotFoundException;
import com.gabel.gabellareferenceshop.mappers.ProductMapper;
import com.gabel.gabellareferenceshop.models.Product;
import com.gabel.gabellareferenceshop.repositories.ProductRepository;
import com.gabel.gabellareferenceshop.services.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service // ✅ Indique que c’est un service métier Spring
@RequiredArgsConstructor // ✅ Génère un constructeur pour les champs final
public class ProductServiceImpl implements ProductService {


        private final ProductRepository productRepository; // 💾 Accès BDD pour Product
        private final ProductMapper productMapper; // 🔄 Mapper DTO ⇄ Entity

        // ✅ Créer un produit
        @Override
        public ProductDto createProduct(ProductDto productDto) {
            try {
                Product product = productMapper.toEntity(productDto); // 🔄 Convertit DTO → entité
                Product savedProduct = productRepository.save(product); // 💾 Sauvegarde dans la BDD
                return productMapper.toDto(savedProduct); // 🔄 Retourne DTO du produit sauvegardé
            } catch (Exception e) {
                throw new RuntimeException("Erreur lors de la création du produit : " + e.getMessage());
            }
        }

        // ✅ Mettre à jour un produit
        @Override
        public ProductDto updateProduct(Long id, ProductDto productDto) {
            try {
                Product existingProduct = productRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé avec l'ID : " + id));

                // Mise à jour des champs  a  augmenter les champ pour la modification du produit
                existingProduct.setName(productDto.getName());
                existingProduct.setDescription(productDto.getDescription());
                existingProduct.setPrice(productDto.getPrice());
                existingProduct.setStock(productDto.getStock());
                existingProduct.setCategory(productDto.getCategory());

                Product updated = productRepository.save(existingProduct);
                return productMapper.toDto(updated);
            } catch (Exception e) {
                throw new RuntimeException("Erreur lors de la mise à jour du produit : " + e.getMessage());
            }
        }

        // ✅ Supprimer un produit
        @Override
        public void deleteProduct(Long id) {
            try {
                if (!productRepository.existsById(id)) {
                    throw new ResourceNotFoundException("Produit non trouvé avec l'ID : " + id);
                }
                productRepository.deleteById(id);
            } catch (Exception e) {
                throw new RuntimeException("Erreur lors de la suppression du produit : " + e.getMessage());
            }
        }

        // ✅ Récupérer un produit par ID
        @Override
        public ProductDto getProductById(Long id) {
            try {
                Product product = productRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé avec l'ID : " + id));
                return productMapper.toDto(product);
            } catch (Exception e) {
                throw new RuntimeException("Erreur lors de la récupération du produit : " + e.getMessage());
            }
        }

        // ✅ Récupérer tous les produits
        @Override
        public List<ProductDto> getAllProducts() {
            try {
                return productRepository.findAll()
                        .stream()
                        .map(productMapper::toDto)
                        .collect(Collectors.toList());
            } catch (Exception e) {
                throw new RuntimeException("Erreur lors de la récupération de la liste des produits : " + e.getMessage());
            }
        }
    }


