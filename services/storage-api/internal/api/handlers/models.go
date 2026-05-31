package handlers

type FileResponse struct {
	ID         string `json:"id"`
	FileName   string `json:"file_name"`
	ObjectName string `json:"object_name"`
	FileSize   int64  `json:"file_size"`
	CreatedAt  string `json:"created_at"`
}

type DirectoryResponse struct {
	Name      string `json:"name"`
	NodeCount int    `json:"node_count"`
	TotalSize int64  `json:"total_size"`
}

type StreamStatsResponse struct {
	UsedStorageBytes int64 `json:"used_storage_bytes"`
	TotalFilesCount  int   `json:"total_files_count"`
}
