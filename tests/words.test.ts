import { expect, it } from "vitest";
import { Spell, spell } from "@/lib/words";

it("spells counts for prose", () => {
  expect(spell(7)).toBe("seven");
  expect(Spell(37)).toBe("Thirty-seven");
  expect(spell(40)).toBe("forty");
  expect(spell(120)).toBe("120");
});
