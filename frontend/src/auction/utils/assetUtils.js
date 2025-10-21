/**
 * Asset utilities for handling backend static files
 */

import { getBackendUrl } from '../../hooks/useConfig';

/**
 * Get full URL for a team logo
 * @param {Object} team - Team object with logoUrl property
 * @returns {string|null} - Full URL to team logo or null
 */
export const getTeamLogoUrl = (team) => {
    if (!team?.logoUrl) return null;
    
    const backendUrl = getBackendUrl();
    if (!backendUrl) return null;
    
    return `${backendUrl}${team.logoUrl}`;
};

/**
 * Get full URL for any asset path
 * @param {string} assetPath - Asset path (e.g., /uploads/teams/xxx.jpeg)
 * @returns {string|null} - Full URL to asset or null
 */
export const getAssetUrl = (assetPath) => {
    if (!assetPath) return null;
    
    const backendUrl = getBackendUrl();
    if (!backendUrl) return null;
    
    return `${backendUrl}${assetPath}`;
};

