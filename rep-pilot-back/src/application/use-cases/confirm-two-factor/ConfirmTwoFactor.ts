import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { InvalidTwoFactorCodeError } from "../../../domain/errors/InvalidTwoFactorCodeError";
import { ConfirmTwoFactorUseCase } from "../../ports/in/ConfirmTwoFactorUseCase";
import { TokenService } from "../../ports/out/TokenService";
import { TotpPort } from "../../ports/out/TotpPort";
import { UserRepository } from "../../ports/out/UserRepository";

export class ConfirmTwoFactor implements ConfirmTwoFactorUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly totp: TotpPort,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: {
    userId: string;
    totpCode: string;
  }): Promise<{ token: string }> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) throw new NotFoundError("User not found");

    if (!user.twoFactorSecret) {
      throw new InvalidTwoFactorCodeError();
    }

    const isValid = await this.totp.verify(
      input.totpCode,
      user.twoFactorSecret,
    );
    if (!isValid) throw new InvalidTwoFactorCodeError();

    const updated = user.enableTwoFactor(user.twoFactorSecret);
    await this.userRepository.save(updated);

    const token = this.tokenService.sign({
      sub: updated.id.toString(),
      username: updated.username,
      isAdmin: updated.isAdmin,
    });
    return { token };
  }
}
