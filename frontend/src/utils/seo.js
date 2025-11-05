/**
 * SEO Utility - Dynamic Meta Tags Management
 * Zero dependencies - uses vanilla JavaScript
 * 
 * Usage:
 * import { updateMetaTags } from '../utils/seo';
 * 
 * useEffect(() => {
 *   updateMetaTags({
 *     title: 'About Us - CodeShare',
 *     description: 'Learn about CodeShare platform',
 *     url: window.location.href,
 *     keywords: 'about, codeshare, platform',
 *     image: 'https://codeshare.com/about-og-image.png'
 *   });
 * }, []);
 */

/**
 * Update meta tags dynamically
 * @param {Object} options - Meta tag options
 * @param {string} options.title - Page title
 * @param {string} options.description - Page description
 * @param {string} options.image - Open Graph image URL
 * @param {string} options.url - Canonical URL
 * @param {string} options.keywords - SEO keywords
 */
export const updateMetaTags = ({ 
  title, 
  description, 
  image, 
  url,
  keywords 
}) => {
  // Update document title
  if (title) {
    document.title = title;
  }
  
  // Helper to update or create meta tag
  const updateMeta = (selector, content) => {
    if (!content) return;
    
    let element = document.querySelector(selector);
    if (element) {
      element.setAttribute('content', content);
    } else {
      // Create if doesn't exist
      element = document.createElement('meta');
      const match = selector.match(/\[(.*?)="(.*?)"\]/);
      if (match) {
        const [, attr, value] = match;
        element.setAttribute(attr, value.replace(/"/g, ''));
        element.setAttribute('content', content);
        document.head.appendChild(element);
      }
    }
  };
  
  // Update basic meta tags
  updateMeta('meta[name="description"]', description);
  updateMeta('meta[name="keywords"]', keywords);
  updateMeta('meta[name="title"]', title);
  
  // Update Open Graph tags
  updateMeta('meta[property="og:title"]', title);
  updateMeta('meta[property="og:description"]', description);
  updateMeta('meta[property="og:image"]', image);
  updateMeta('meta[property="og:url"]', url);
  
  // Update Twitter tags
  updateMeta('meta[property="twitter:title"]', title);
  updateMeta('meta[property="twitter:description"]', description);
  updateMeta('meta[property="twitter:image"]', image);
  updateMeta('meta[property="twitter:url"]', url);
  
  // Update canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (canonical && url) {
    canonical.setAttribute('href', url);
  } else if (url && !canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', url);
    document.head.appendChild(canonical);
  }
};

/**
 * Reset meta tags to defaults (homepage)
 */
export const resetMetaTags = () => {
  updateMetaTags({
    title: 'CodeShare - Free Collaborative Document Editor & Code Sharing',
    description: 'CodeShare is a free, real-time collaborative document editor and code sharing platform. Create, edit, and share documents instantly with beautiful formatting, file uploads, and live collaboration.',
    url: window.location.origin,
  });
};

/**
 * Get default meta configuration for common pages
 */
export const getPageMeta = (pageName) => {
  const baseMeta = {
    about: {
      title: 'About Us - CodeShare',
      description: 'Learn about CodeShare - a free collaborative document editor and code sharing platform. Built for developers, students, and teams.',
      keywords: 'about codeshare, document editor, code sharing platform, team collaboration',
      url: `${window.location.origin}/about`,
    },
    help: {
      title: 'Help & Documentation - CodeShare',
      description: 'Get help with CodeShare. Learn how to use our collaborative document editor and code sharing features.',
      keywords: 'codeshare help, documentation, how to use, tutorial, guide',
      url: `${window.location.origin}/help`,
    },
    games: {
      title: 'Games - CodeShare',
      description: 'Play fun games on CodeShare. Take a break from coding and document editing.',
      keywords: 'codeshare games, online games, fun, entertainment',
      url: `${window.location.origin}/games`,
    },
    login: {
      title: 'Login - CodeShare',
      description: 'Login to your CodeShare account to access your documents and start collaborating.',
      keywords: 'codeshare login, sign in, account access',
      url: `${window.location.origin}/auth/login`,
    },
    register: {
      title: 'Sign Up - CodeShare',
      description: 'Create a free CodeShare account to start creating and sharing documents with real-time collaboration.',
      keywords: 'codeshare signup, register, create account, free account',
      url: `${window.location.origin}/auth/register`,
    },
  };
  
  return baseMeta[pageName] || null;
};

