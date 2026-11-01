import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPolicy } from "../../../../lib/shopify/policies";
import PolicyPage from "./page";

vi.mock("server-only", () => ({}));
vi.mock("../../../../lib/shopify/policies", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../../lib/shopify/policies")>()),
  getPolicy: vi.fn(),
}));

const withHandle = (handle: string) => ({ params: Promise.resolve({ handle }) });

describe("policy page", () => {
  beforeEach(() => {
    vi.mocked(getPolicy).mockReset();
  });

  it("shows a written policy with its body as written", async () => {
    vi.mocked(getPolicy).mockResolvedValue({
      title: "Terms of service",
      body: "<h2>Exchanges</h2><p>Within 7 days.</p>",
    });

    const markup = renderToStaticMarkup(await PolicyPage(withHandle("terms-of-service")));

    expect(markup).toContain(">Terms of service</h1>");
    expect(markup).toContain("<h2>Exchanges</h2><p>Within 7 days.</p>");
  });

  it("is not found while the policy is unwritten", async () => {
    vi.mocked(getPolicy).mockResolvedValue(null);

    await expect(PolicyPage(withHandle("refund-policy"))).rejects.toThrow();
  });

  it("is not found for an unknown handle, without asking Shopify", async () => {
    await expect(PolicyPage(withHandle("shipping"))).rejects.toThrow();

    expect(getPolicy).not.toHaveBeenCalled();
  });
});
