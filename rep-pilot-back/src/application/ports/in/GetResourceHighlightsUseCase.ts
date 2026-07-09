import { ResourceHighlightsDTO } from "../../dto/ResourceHighlightsDTO";

export interface GetResourceHighlightsUseCase {
  execute(): Promise<ResourceHighlightsDTO>;
}
