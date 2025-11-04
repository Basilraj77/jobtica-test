// FIX: Moved job utils logic to the .ts file to resolve module issues.
import { Job, AdSettings, PlacementKey, JobStatus } from '../types.ts';

/**
 * Determines the effective status of a job.
 * If the last date to apply is in the past, it's considered 'expired',
 * otherwise it returns the job's stored status.
 */
export const getEffectiveJobStatus = (job: Job): JobStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to the start of the day
  const lastDate = new Date(job.lastDate);

  if (lastDate < today) {
    return 'expired';
  }
  
  return job.status;
};

/**
 * Resolves the final ad code for a given placement setting.
 * Checks for test mode first.
 * @param {PlacementKey} placementKey - The key of the ad placement (e.g., 'headerAd').
 * @param {AdSettings} adSettings - The complete AdSettings object.
 * @returns {string} The ad code string (or a test placeholder) if enabled, otherwise an empty string.
 */
export const getAdCodeForPlacement = (placementKey: PlacementKey, adSettings: AdSettings): string => {
    if (!adSettings) {
        return '';
    }
    const { adNetworks, activeTests } = adSettings;
    const placement = adSettings[placementKey];

    const isTestActive = activeTests?.includes(placementKey);

    if (isTestActive) {
        return `<!-- JOBTICA_TEST_AD::${placementKey} -->`;
    }
    
    if (!placement || !placement.enabled) {
        return '';
    }

    if (placement.type === 'network' && placement.networkKey && adNetworks?.[placement.networkKey]) {
        return adNetworks[placement.networkKey].code || '';
    }
    
    if (placement.type === 'custom') {
        return placement.customCode || '';
    }

    return '';
};
