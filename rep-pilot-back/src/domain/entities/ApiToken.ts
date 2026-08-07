import { randomBytes, createHash } from "crypto";
import { DomainValidationError } from "../errors/DomainValidationError";
import { UserId } from "../value-objects/UserId";

/**
 * Token de API para autenticar la extensión de VS Code y otros clientes externos.
 *
 * - El token plano solo se muestra una vez al crearlo.
 * - Se almacena el hash SHA-256 del token, no el token en sí.
 * - El prefix (últimos 8 chars) se guarda en plano para identificar el token.
 */
export class ApiToken {
  /** El token plano (solo disponible en el momento de creación) */
  public readonly plainToken?: string;

  private constructor(
    public readonly id: string,
    public readonly userId: UserId,
    public readonly name: string,
    public readonly tokenHash: string,
    public readonly prefix: string,
    public readonly lastUsedAt: Date | null,
    public readonly createdAt: Date,
    plainToken?: string,
  ) {
    this.plainToken = plainToken;
  }

  /**
   * Crea un nuevo ApiToken generando un token aleatorio seguro.
   * @param params.name - nombre descriptivo (ej: "VS Code en portátil")
   * @param params.userId - ID del usuario dueño del token
   */
  static create(params: {
    id?: string;
    name: string;
    userId: UserId;
  }): ApiToken {
    const normalizedName = params.name?.trim();
    if (!normalizedName) {
      throw new DomainValidationError("ApiToken name is required");
    }

    // Generar token aleatorio: 32 bytes → 64 caracteres hex
    const plainToken = randomBytes(32).toString("hex");

    // Hash SHA-256 para almacenar
    const tokenHash = createHash("sha256").update(plainToken).digest("hex");

    // Prefijo visible: últimos 8 caracteres del hash (no del token plano)
    const prefix = tokenHash.slice(-8);

    return new ApiToken(
      params.id ?? randomBytes(16).toString("hex"),
      params.userId,
      normalizedName,
      tokenHash,
      prefix,
      null,
      new Date(),
      plainToken,
    );
  }

  /**
   * Reconstruye un ApiToken desde la base de datos (sin el token plano).
   */
  static fromPersistence(params: {
    id: string;
    userId: string;
    name: string;
    tokenHash: string;
    prefix: string;
    lastUsedAt: Date | null;
    createdAt: Date;
  }): ApiToken {
    return new ApiToken(
      params.id,
      UserId.create(params.userId),
      params.name,
      params.tokenHash,
      params.prefix,
      params.lastUsedAt,
      params.createdAt,
    );
  }

  /**
   * Marca el token como usado (actualiza lastUsedAt).
   */
  markUsed(): ApiToken {
    return new ApiToken(
      this.id,
      this.userId,
      this.name,
      this.tokenHash,
      this.prefix,
      new Date(),
      this.createdAt,
    );
  }

  /**
   * Compara un token plano con el hash almacenado.
   */
  verify(plainToken: string): boolean {
    const hash = createHash("sha256").update(plainToken).digest("hex");
    return hash === this.tokenHash;
  }
}
