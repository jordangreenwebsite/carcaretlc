// Preview-only navigation rewrite. Do not merge this file into production.
class PreviewLink {
  constructor(origin, attribute) { this.origin = origin; this.attribute = attribute; }
  element(element) {
    const value = element.getAttribute(this.attribute);
    if (!value) return;
    let result = value;
    for (const domain of ["https://carcaretlc.co.uk", "http://carcaretlc.co.uk", "https://www.carcaretlc.co.uk", "http://www.carcaretlc.co.uk", "https://carcaretlc.com", "http://carcaretlc.com", "https://www.carcaretlc.com", "http://www.carcaretlc.com"]) {
      result = result.split(domain).join(this.origin);
    }
    if (result !== value) element.setAttribute(this.attribute, result);
  }
}
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (!(response.headers.get("content-type") || "").includes("text/html")) return response;
    const origin = new URL(request.url).origin;
    let rewriter = new HTMLRewriter();
    for (const [selector, attribute] of [
      ["a[href]", "href"], ["link[href]", "href"],
      ["script[src]", "src"], ["img[src]", "src"],
      ["img[srcset]", "srcset"], ["source[src]", "src"],
      ["source[srcset]", "srcset"], ["form[action]", "action"]
    ]) rewriter = rewriter.on(selector, new PreviewLink(origin, attribute));
    const headers = new Headers(response.headers);
    headers.set("X-Robots-Tag", "noindex, nofollow");
    return rewriter.transform(new Response(response.body, {status: response.status, headers}));
  }
};
