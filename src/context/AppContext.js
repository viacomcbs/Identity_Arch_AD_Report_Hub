import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import axios from 'axios';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showAbortConfirm, setShowAbortConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  
  // Forest/Domain selector state
  const [forestData, setForestData] = useState(null);
  const [forestLoading, setForestLoading] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(() => {
    try {
      const saved = localStorage.getItem('ad-report-hub-selected-domain');
      return saved || ''; // '' means "All Domains / Current Forest"
    } catch {
      return '';
    }
  });

  // Fetch available forests on mount
  useEffect(() => {
    const fetchForests = async () => {
      setForestLoading(true);
      try {
        const response = await axios.get('/api/topology/forests');
        const data = response.data.data;
        setForestData(data);
        // Auto-select first forest root if none is already selected
        setSelectedDomain((prev) => {
          if (prev) return prev;
          const firstForestRoot = data?.forests?.[0]?.root || '';
          if (firstForestRoot) {
            localStorage.setItem('ad-report-hub-selected-domain', firstForestRoot);
            return firstForestRoot;
          }
          return prev;
        });
      } catch (err) {
        console.error('Failed to fetch forest data:', err);
      } finally {
        setForestLoading(false);
      }
    };
    fetchForests();
  }, []);

  const changeSelectedDomain = useCallback((domain) => {
    setSelectedDomain(domain);
    localStorage.setItem('ad-report-hub-selected-domain', domain);
  }, []);

  // Favorites state - initialized from localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('ad-report-hub-favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const MAX_RECENT_ITEMS = 10;

  // Add activity to recent list
  const addRecentActivity = useCallback((activity) => {
    const newActivity = {
      id: Date.now(),
      ...activity,
      timestamp: new Date().toISOString()
    };
    
    setRecentActivity(prev => {
      const filtered = prev.filter(a => 
        !(a.path === activity.path && a.query === activity.query)
      );
      return [newActivity, ...filtered].slice(0, MAX_RECENT_ITEMS);
    });
  }, []);

  // Start a report (set loading state)
  const startReport = useCallback((reportName, path) => {
    setIsLoading(true);
    setCurrentReport({ name: reportName, path, startTime: Date.now() });
  }, []);

  // End a report (clear loading state)
  const endReport = useCallback(() => {
    setIsLoading(false);
    setCurrentReport(null);
  }, []);

  // Request navigation (shows confirmation if loading)
  const requestNavigation = useCallback((path, callback) => {
    if (isLoading) {
      setPendingNavigation({ path, callback });
      setShowAbortConfirm(true);
      return false; // Navigation blocked
    }
    return true; // Navigation allowed
  }, [isLoading]);

  // Confirm abort and navigate
  const confirmAbort = useCallback(() => {
    setIsLoading(false);
    setCurrentReport(null);
    setShowAbortConfirm(false);
    if (pendingNavigation?.callback) {
      pendingNavigation.callback();
    }
    setPendingNavigation(null);
  }, [pendingNavigation]);

  // Cancel abort
  const cancelAbort = useCallback(() => {
    setShowAbortConfirm(false);
    setPendingNavigation(null);
  }, []);

  // Clear recent activity
  const clearRecentActivity = useCallback(() => {
    setRecentActivity([]);
  }, []);

  // Favorites management
  const addFavorite = useCallback((favorite) => {
    setFavorites(prev => {
      // Avoid duplicates based on page + queryId
      const exists = prev.some(f => f.page === favorite.page && f.queryId === favorite.queryId);
      if (exists) return prev;
      const newFavs = [...prev, { ...favorite, id: Date.now(), addedAt: new Date().toISOString() }];
      localStorage.setItem('ad-report-hub-favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  }, []);

  const removeFavorite = useCallback((page, queryId) => {
    setFavorites(prev => {
      const newFavs = prev.filter(f => !(f.page === page && f.queryId === queryId));
      localStorage.setItem('ad-report-hub-favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  }, []);

  const isFavorite = useCallback((page, queryId) => {
    return favorites.some(f => f.page === page && f.queryId === queryId);
  }, [favorites]);

  // Validates that enteredDomain belongs to the currently selected forest.
  // Returns null if valid, or an error string if the domain is from the wrong forest.
  const validateDomainForForest = useCallback((enteredDomain) => {
    if (!enteredDomain || !forestData?.forests) return null;
    const normalized = enteredDomain.toLowerCase().trim();
    const currentForest = forestData.forests.find(
      f => f.root.toLowerCase() === (selectedDomain || '').toLowerCase()
    );
    if (!currentForest) return null;

    const forestRoot = currentForest.root.toLowerCase();
    const belongsToCurrent = normalized === forestRoot || normalized.endsWith('.' + forestRoot);
    if (belongsToCurrent) return null;

    // Find which forest the entered domain belongs to
    const wrongForest = forestData.forests.find(f => {
      const r = f.root.toLowerCase();
      return normalized === r || normalized.endsWith('.' + r);
    });
    if (wrongForest) {
      return `"${enteredDomain}" belongs to the ${wrongForest.name}. Switch the forest selector to ${wrongForest.name} before running this report.`;
    }
    return `"${enteredDomain}" does not belong to the selected ${currentForest.name} (${currentForest.root}). Verify the domain name and selected forest.`;
  }, [selectedDomain, forestData]);

  const value = {
    isLoading,
    currentReport,
    recentActivity,
    showAbortConfirm,
    pendingNavigation,
    startReport,
    endReport,
    addRecentActivity,
    requestNavigation,
    confirmAbort,
    cancelAbort,
    clearRecentActivity,
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    forestData,
    forestLoading,
    selectedDomain,
    changeSelectedDomain,
    validateDomainForForest,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
