// Preview-only Cloudflare Pages worker. This file is intentionally kept on New-photos,
// not main. Rewrites exported WordPress absolute internal URLs to the preview origin.
const internalHosts = new Set(["carcaretlc.co.uk", "www.carcaretlc.co.uk", "carcaretlc.com", "www.carcaretlc.com"]);
class PreviewUrls {
  constructor(origin, attribute) { this.origin = origin; this.attribute = attribute; }
  element(element) {
    const value = element.getAttribute(this.attribute);
    if (!value) return;
    const rewritten = value.replace(/https?:\\/\\/(?:www\\.)?carcaretlc\\.(?:co\\.uk|com)(?=\\/|\\?|#|\\s|$)/gi, this.origin);
    if (rewritten !== value) element.setAttribute(this.attribute, rewritten);
  }
}
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return response;
    const origin = new URL(request.url).origin;
    let html = new HTMLRewriter();
    for (const [selector, attribute] of [
      ["a[href]", "href"], ["link[href]", "href"], ["script[src]", "src"],
      ["img[src]", "src"], ["img[srcset]", "srcset"],
      ["source[src]", "src"], ["source[srcset]", "srcset"],
      ["form[action]", "action"]
    ]) html = html.on(selector, new PreviewUrls(origin, attribute));
    const headers = new Headers(response.headers);
    headers.set("X-Robots-Tag", "noindex, nofollow");
    return html.transform(new Response(response.body, {status: response.status, headers}));
  }
};
