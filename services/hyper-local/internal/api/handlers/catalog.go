package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/hyper-realm/hyper-local/internal/database"
	"github.com/hyper-realm/hyper-local/internal/models"
)

// GetCategories fetches all active categories from the database
func GetCategories(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query("SELECT id, parent_id, name, slug, description, is_active, created_at FROM categories WHERE is_active = true")
	if err != nil {
		http.Error(w, "Failed to fetch categories", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var categories []models.Category
	for rows.Next() {
		var cat models.Category
		if err := rows.Scan(&cat.ID, &cat.ParentID, &cat.Name, &cat.Slug, &cat.Description, &cat.IsActive, &cat.CreatedAt); err != nil {
			continue
		}
		categories = append(categories, cat)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}

// CreateCategory adds a new category to the database
func CreateCategory(w http.ResponseWriter, r *http.Request) {
	var cat models.Category
	if err := json.NewDecoder(r.Body).Decode(&cat); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	query := `INSERT INTO categories (name, slug, description, parent_id, is_active) 
	          VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`
	err := database.DB.QueryRow(query, cat.Name, cat.Slug, cat.Description, cat.ParentID, true).Scan(&cat.ID, &cat.CreatedAt)

	if err != nil {
		http.Error(w, "Failed to create category", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(cat)
}

// GetProducts fetches all active products from the database
func GetProducts(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query("SELECT id, category_id, brand_id, name, slug, description, base_price, is_active, created_at FROM products WHERE is_active = true")
	if err != nil {
		http.Error(w, "Failed to fetch products", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var prod models.Product
		if err := rows.Scan(&prod.ID, &prod.CategoryID, &prod.BrandID, &prod.Name, &prod.Slug, &prod.Description, &prod.BasePrice, &prod.IsActive, &prod.CreatedAt); err != nil {
			continue
		}
		products = append(products, prod)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}

// CreateProduct adds a new product to the database
func CreateProduct(w http.ResponseWriter, r *http.Request) {
	var prod models.Product
	if err := json.NewDecoder(r.Body).Decode(&prod); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	query := `INSERT INTO products (category_id, brand_id, name, slug, description, base_price, is_active) 
	          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, created_at`
	err := database.DB.QueryRow(query, prod.CategoryID, prod.BrandID, prod.Name, prod.Slug, prod.Description, prod.BasePrice, true).Scan(&prod.ID, &prod.CreatedAt)

	if err != nil {
		http.Error(w, "Failed to create product", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(prod)
}
