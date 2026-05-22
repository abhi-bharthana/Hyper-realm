package api

import (
	"hyper-id/internal/db"
	"net/http"
)

func HandleAuthInitiate(w http.ResponseWriter, r *http.Request) {
	clientID := r.URL.Query().Get("client_id")

	// 1. Verify Client
	client, err := db.GetClientByID(clientID)
	if err != nil || client == nil {
		http.Error(w, "Invalid Client ID. Registration required.", http.StatusUnauthorized)
		return
	}

	// 2. Redirect to our Login GUI with Client Context
	// Hum redirect_uri ko query param mein pass karenge taaki baad mein use kar sakein
	authPage := "/?client_id=" + client.ClientID + "&redirect_uri=" + client.RedirectURI
	http.Redirect(w, r, authPage, http.StatusTemporaryRedirect)
}
