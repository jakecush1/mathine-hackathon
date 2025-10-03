import { H3Event, proxyRequest, ProxyOptions } from "h3";

// Default event handler to proxy any request without a defined handler to the backend api.
const proxy = defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig();
  // Populate the auth token
  const headers = getHeaders(event);
  const opts: ProxyOptions = { headers: headers };
  const url = event.node.req.url;
  console.log(url, config.backend_url);
  
  if (!url) return;
  const proxyUrl = new URL(url?.replace(/^\/api/, ""), config.backend_url);
  console.debug(`Proxying ${url} to ${proxyUrl.toString()}`);

  return await proxyRequest(event, proxyUrl.toString(), opts);
});
export default proxy;