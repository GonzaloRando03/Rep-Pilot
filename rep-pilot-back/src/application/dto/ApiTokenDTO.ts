export interface ApiTokenDTO {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

/** Solo se devuelve en el momento de creación del token */
export interface CreatedApiTokenDTO {
  token: ApiTokenDTO;
  plainToken: string;
}
