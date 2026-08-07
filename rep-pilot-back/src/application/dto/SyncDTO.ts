import { ProjectFileEntry } from "./ProjectDTO";

/** Entrada de sincronización desde la extensión */
export interface SyncRequestDTO {
  /** Archivos modificados localmente que se quieren subir */
  files: ProjectFileEntry[];
  /** Timestamp de la última sincronización (ISO 8601) o null si es la primera */
  lastSyncAt: string | null;
}

/** Fichero con su timestamp de última modificación en servidor */
export interface ProjectFileWithMetaDTO {
  path: string;
  content: string;
  serverModifiedAt: string;
  lastModifiedBy?: string;
}

/** Conflicto detectado: mismo archivo modificado en ambos lados */
export interface SyncConflictDTO {
  path: string;
  localContent: string;
  serverContent: string;
  serverModifiedAt: string;
}

/** Respuesta del sync */
export interface SyncResponseDTO {
  /** Archivos que cambiaron en el servidor desde lastSyncAt (que el cliente no envió) */
  changedFiles: ProjectFileWithMetaDTO[];
  /** Archivos con conflicto (modificados en ambos lados) */
  conflicts: SyncConflictDTO[];
  /** Nuevo timestamp de sincronización para la próxima llamada */
  newLastSyncAt: string;
}
