import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { InvalidTwoFactorCodeError } from "../../../domain/errors/InvalidTwoFactorCodeError";
import { DisableTwoFactorUseCase } from "../../ports/in/DisableTwoFactorUseCase";
import { TotpPort } from "../../ports/out/TotpPort";
import { UserRepository } from "../../ports/out/UserRepository";

export class DisableTwoFactor implements DisableTwoFactorUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly totp: TotpPort,
  ) {}

  async execute(input: { userId: string; totpCode: string }): Promise<void> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) throw new NotFoundError("User not found");

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new InvalidTwoFactorCodeError();
    }

    const isValid = await this.totp.verify(input.totpCode, user.twoFactorSecret);
    if (!isValid) throw new InvalidTwoFactorCodeError();

    const updated = user.disableTwoFactor();
    await this.userRepository.save(updated);
  }
}
