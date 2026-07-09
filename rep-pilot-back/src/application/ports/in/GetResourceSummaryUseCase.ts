import { ResourceSummaryDTO } from "../../dto/ResourceSummaryDTO";

export interface GetResourceSummaryUseCase {
  execute(): Promise<ResourceSummaryDTO>;
}
