import React, { useEffect, useRef } from 'react';
import { getAdsensePublisherId } from '../../hooks/useConfig';

/**
 * Reusable Google AdSense ad slot
 *
 * - Uses default publisher ID but can be overridden from public/config.json
 * - Safe no-op if AdSense script is not yet loaded
 *
 * Props:
 * - adSlot: optional AdSense ad slot ID (string)
 * - adFormat: ad format (default: "auto")
 * - fullWidth: whether to allow full width responsive (default: true)
 * - className: optional additional class names
 */
const AdSlot = ({
  adSlot = '',
  adFormat = 'auto',
  fullWidth = true,
  className = '',
}) => {
  const adRef = useRef(null);
  const publisherId = getAdsensePublisherId();

  useEffect(() => {
    try {
      if (!window || !window.adsbygoogle || !adRef.current) {
        return;
      }

      // Push a new ad request
      // eslint-disable-next-line no-undef
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Silently ignore AdSense errors to avoid impacting app
    }
  }, [publisherId, adSlot, adFormat, fullWidth]);

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle block ${className}`}
      style={{ display: 'block' }}
      data-ad-client={publisherId}
      {...(adSlot ? { 'data-ad-slot': adSlot } : {})}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidth ? 'true' : 'false'}
    />
  );
};

export default AdSlot;


