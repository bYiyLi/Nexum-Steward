import manual from "../../../INSTALL.md?raw";

export const prerender = true;

export function GET() {
  return new Response(manual, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" }
  });
}
