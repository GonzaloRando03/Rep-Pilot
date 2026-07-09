import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { SetupTwoFactorUseCase } from "../../ports/in/SetupTwoFactorUseCase";
import { TotpPort } from "../../ports/out/TotpPort";
import { UserRepository } from "../../ports/out/UserRepository";

const APP_NAME = "RepPilot";

export class SetupTwoFactor implements SetupTwoFactorUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly totp: TotpPort,
  ) {}

  async execute(userId: string): Promise<{ qrUri: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const secret = this.totp.generateSecret();
    const updated = user.withPendingTwoFactorSecret(secret);
    await this.userRepository.save(updated);

    const qrUri = this.totp.generateQrUri(secret, user.username, APP_NAME);
    return { qrUri };
  }
}
