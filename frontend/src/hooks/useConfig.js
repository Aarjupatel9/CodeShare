import { useState, useEffect } from 'react';

/**
 * Global config cache
 * Shared across all components to avoid multiple fetch calls
 */
let configCache = null;
let configPromise = null;

/**
 * Fetch config from config.json
 * Returns cached config if already loaded
 */
const fetchConfig = async () => {
    // Return cached config if available
    if (configCache) {
        return configCache;
    }

    // If already fetching, return the same promise
    if (configPromise) {
        return configPromise;
    }

    // Fetch config
    configPromise = fetch('/config.json')
        .then(res => res.json())
        .then(config => {
            configCache = config;
            configPromise = null;
            return config;
        })
        .catch(err => {
            console.error('Error loading config:', err);
            configPromise = null;
            throw err;
        });

    return configPromise;
};

/**
 * Custom hook to access application config
 * Loads config once on first use and caches it
 * 
 * @returns {Object} { config, loading, error }
 * 
 * Usage:
 * const { config, loading } = useConfig();
 */
export const useConfig = () => {
    const [config, setConfig] = useState(configCache);
    const [loading, setLoading] = useState(!configCache);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (configCache) {
            setConfig(configCache);
            setLoading(false);
            return;
        }

        fetchConfig()
            .then(cfg => {
                setConfig(cfg);
                setLoading(false);
            })
            .catch(err => {
                setError(err);
                setLoading(false);
            });
    }, []);

    return { config, loading, error };
};

/**
 * Get backend URL from config
 * Returns empty string if config not loaded
 * 
 * @returns {string} Backend URL
 */
export const getBackendUrl = () => {
    return configCache?.backend_url || '';
};

/**
 * Get backend socket URL from config
 * Returns empty string if config not loaded
 * 
 * @returns {string} Backend socket URL
 */
export const getBackendSocketUrl = () => {
    return configCache?.backend_socket_url || '';
};

/**
 * Get auction website URL from config
 * Returns default URL if config not loaded
 * 
 * @returns {string} Auction website URL
 */
export const getAuctionUrl = () => {
    return configCache?.auction_url || 'https://codeshare.auctionng.org';
};

/**
 * Get Google AdSense publisher ID from config
 * Falls back to default CodeShare publisher ID if not configured
 *
 * @returns {string} AdSense publisher ID
 */
export const getAdsensePublisherId = () => {
    const DEFAULT_PUBLISHER_ID = 'ca-pub-8653039795540767';
    return configCache?.adsense_publisher_id || DEFAULT_PUBLISHER_ID;
};

/**
 * Preload config (call this in App.js or index.js)
 * Ensures config is loaded before components need it
 */
export const preloadConfig = async () => {
    await fetchConfig();
};

export default useConfig;

