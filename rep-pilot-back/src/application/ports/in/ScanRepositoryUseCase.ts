import {
  ScanRepositoryInputDTO,
  ScanRepositoryResponseDTO,
} from "../../dto/ScanRepositoryDTO";

export interface ScanRepositoryUseCase {
  execute(input: ScanRepositoryInputDTO): Promise<ScanRepositoryResponseDTO>;
}
