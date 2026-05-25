export interface StorageFile {
  id: string;
  file_name: string;
  object_name: string;
  file_size: number;
  created_at: string;
}

export interface StorageFolder {
  name: string;
}

export interface FileListTableProps {
  isLight: boolean;
  viewMode?: 'grid' | 'list';
  searchQuery: string;
}