import { describe, it, expect, vi } from "vitest";
import { ListUsers } from "./ListUsers";
import { mockUserRepository, buildUser } from "../__test-helpers";

function setup() {
  const ur = mockUserRepository();
  return { useCase: new ListUsers(ur), ur };
}

describe("ListUsers", () => {
  it("should return all users", async () => {
    const { useCase, ur } = setup();
    vi.mocked(ur.findAll).mockResolvedValue([
      buildUser({ id: "u1", username: "alice" }),
    ]);
    const r = await useCase.execute();
    expect(r).toHaveLength(1);
    expect(r[0].username).toBe("alice");
  });

  it("should return empty when no users", async () => {
    const { useCase, ur } = setup();
    vi.mocked(ur.findAll).mockResolvedValue([]);
    const r = await useCase.execute();
    expect(r).toEqual([]);
  });
});
