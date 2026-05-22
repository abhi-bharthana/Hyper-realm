package db

import (
	"database/sql"
	"hyper-id/internal/models"
)

func GetClientByID(clientID string) (*models.Client, error) {
	var client models.Client
	err := DB.QueryRow(`
        SELECT client_id, client_name, redirect_uri 
        FROM h_clients 
        WHERE client_id = $1`,
		clientID).Scan(&client.ClientID, &client.ClientName, &client.RedirectURI)

	if err == sql.ErrNoRows {
		return nil, nil // Client nahi mila
	}
	return &client, err
}
