import { ResourceDTO } from "./ResourceDTO";

export interface ResourceDetailDTO extends ResourceDTO {
  docMD: string | null;
  owner: string | null;
  provider: "github" | "gitlab" | null;
}
