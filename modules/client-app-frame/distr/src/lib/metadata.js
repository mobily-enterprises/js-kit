export const updateMetadata = ({ title, description, url, image, imageAlt }) => {
    if (title) {
        document.title = title;
        setMetaTag('property', 'og:title', title);
    }
    if (description) {
        setMetaTag('name', 'description', description);
        setMetaTag('property', 'og:description', description);
    }
    if (image) {
        setMetaTag('property', 'og:image', image);
    }
    if (imageAlt) {
        setMetaTag('property', 'og:image:alt', imageAlt);
    }
    url = url || window.location.href;
    setMetaTag('property', 'og:url', url);
};

export function setMetaTag(attrName, attrValue, content) {
    let element = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
    }
    element.setAttribute('content', content || '');
}
