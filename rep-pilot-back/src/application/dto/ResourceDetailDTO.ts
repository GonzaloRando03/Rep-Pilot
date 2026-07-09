import { ResourceDTO } from "./ResourceDTO";

export interface ResourceDetailDTO extends ResourceDTO {
  docMD: string | null;
  owner: string;
  provider: "github" | "gitlab";
}
