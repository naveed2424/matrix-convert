/**
 * Dynamic SEO, OpenGraph, Canonical URL & Schema.org Structured Data Manager for Mimage
 */

export interface PageSeoMetadata {
  title: string;
  description: string;
  canonicalPath: string;
  type?: 'website' | 'article';
  breadcrumbs?: { name: string; url: string }[];
  softwareApp?: {
    name: string;
    description: string;
    category?: string;
  };
}

const SITE_ORIGIN = 'https://fixpdf.org';

function setMetaTag(selector: string, attrName: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function updatePageSeo(meta: PageSeoMetadata) {
  const fullTitle = meta.title.includes('Mimage') ? meta.title : `${meta.title} | Mimage`;
  const cleanPath = meta.canonicalPath.startsWith('/') ? meta.canonicalPath : `/${meta.canonicalPath}`;
  const canonicalUrl = `${SITE_ORIGIN}${cleanPath === '/' ? '/' : cleanPath}`;

  document.title = fullTitle;
  setMetaTag('meta[name="description"]', 'name', 'description', meta.description);
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', meta.description);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', meta.type || 'website');
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', meta.description);

  let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!linkCanonical) {
    linkCanonical = document.createElement('link');
    linkCanonical.setAttribute('rel', 'canonical');
    document.head.appendChild(linkCanonical);
  }
  linkCanonical.setAttribute('href', canonicalUrl);

  // Inject dynamic BreadcrumbList / SoftwareApplication JSON-LD without fake ratings
  const scriptId = 'mimage-route-jsonld';
  let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
  const graph: any[] = [];

  if (meta.breadcrumbs && meta.breadcrumbs.length > 0) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: meta.breadcrumbs.map((crumb, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: crumb.name,
        item: crumb.url.startsWith('http') ? crumb.url : `${SITE_ORIGIN}${crumb.url}`
      }))
    });
  }

  if (meta.softwareApp) {
    graph.push({
      '@type': 'SoftwareApplication',
      name: meta.softwareApp.name,
      applicationCategory: meta.softwareApp.category || 'UtilitiesApplication',
      operatingSystem: 'All',
      url: canonicalUrl,
      description: meta.softwareApp.description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      }
    });
  }

  if (graph.length > 0) {
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': graph
    });
  } else if (scriptEl) {
    scriptEl.remove();
  }
}
