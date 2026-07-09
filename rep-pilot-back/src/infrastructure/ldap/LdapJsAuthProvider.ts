import ldap from "ldapjs";
import {
  LdapAuthPort,
  LdapAuthResult,
} from "../../application/ports/out/LdapAuthPort";

export class LdapJsAuthProvider implements LdapAuthPort {
  async authenticate(
    url: string,
    bindDnTemplate: string,
    username: string,
    password: string,
  ): Promise<LdapAuthResult> {
    const userDn = bindDnTemplate.replace("{{username}}", username);

    const client = ldap.createClient({ url });

    return new Promise<LdapAuthResult>((resolve, reject) => {
      client.on("error", (err) => {
        reject(err);
      });

      client.bind(userDn, password, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true, displayName: username });
        }
      });
    }).finally(() => {
      this.destroyClient(client);
    });
  }

  private destroyClient(client: ldap.Client): void {
    try {
      client.destroy();
    } catch {
      // Ignore destroy errors
    }
  }
}
