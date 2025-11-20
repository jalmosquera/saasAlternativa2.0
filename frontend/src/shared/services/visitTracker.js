/**
 * Visit Tracker Service
 * Tracks unique and total visits to the application
 */

const VISITS_KEY = 'app_visits';
const UNIQUE_VISITOR_KEY = 'unique_visitor_id';
const LAST_VISIT_KEY = 'last_visit_date';

/**
 * Initialize visits data structure
 */
const initVisitsData = () => ({
  total: 0,
  unique: 0,
  daily: {},
  weekly: {},
  monthly: {},
});

/**
 * Get visits data from localStorage
 */
export const getVisitsData = () => {
  try {
    const data = localStorage.getItem(VISITS_KEY);
    return data ? JSON.parse(data) : initVisitsData();
  } catch (error) {
    console.error('Error reading visits data:', error);
    return initVisitsData();
  }
};

/**
 * Save visits data to localStorage
 */
const saveVisitsData = (data) => {
  try {
    localStorage.setItem(VISITS_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving visits data:', error);
  }
};

/**
 * Generate a unique visitor ID
 */
const generateVisitorId = () => {
  return `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Get or create unique visitor ID
 */
const getVisitorId = () => {
  let visitorId = localStorage.getItem(UNIQUE_VISITOR_KEY);
  if (!visitorId) {
    visitorId = generateVisitorId();
    localStorage.setItem(UNIQUE_VISITOR_KEY, visitorId);
  }
  return visitorId;
};

/**
 * Check if this is a new unique visit (once per day)
 */
const isNewUniqueVisit = () => {
  const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
  const today = new Date().toDateString();
  return lastVisit !== today;
};

/**
 * Get date keys for tracking
 */
const getDateKeys = () => {
  const now = new Date();
  const daily = now.toDateString();
  const weekly = `${now.getFullYear()}-W${getWeekNumber(now)}`;
  const monthly = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return { daily, weekly, monthly };
};

/**
 * Get ISO week number
 */
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

/**
 * Track a new visit
 */
export const trackVisit = () => {
  const visitsData = getVisitsData();
  const { daily, weekly, monthly } = getDateKeys();
  const isUnique = isNewUniqueVisit();

  // Get or create visitor ID
  getVisitorId();

  // Increment total visits
  visitsData.total += 1;

  // Increment unique visits if new
  if (isUnique) {
    visitsData.unique += 1;
    localStorage.setItem(LAST_VISIT_KEY, new Date().toDateString());
  }

  // Track daily visits
  if (!visitsData.daily[daily]) {
    visitsData.daily[daily] = { total: 0, unique: 0 };
  }
  visitsData.daily[daily].total += 1;
  if (isUnique) {
    visitsData.daily[daily].unique += 1;
  }

  // Track weekly visits
  if (!visitsData.weekly[weekly]) {
    visitsData.weekly[weekly] = { total: 0, unique: 0 };
  }
  visitsData.weekly[weekly].total += 1;
  if (isUnique) {
    visitsData.weekly[weekly].unique += 1;
  }

  // Track monthly visits
  if (!visitsData.monthly[monthly]) {
    visitsData.monthly[monthly] = { total: 0, unique: 0 };
  }
  visitsData.monthly[monthly].total += 1;
  if (isUnique) {
    visitsData.monthly[monthly].unique += 1;
  }

  saveVisitsData(visitsData);
  return visitsData;
};

/**
 * Get statistics for dashboard
 */
export const getVisitStats = () => {
  const visitsData = getVisitsData();
  const { daily, weekly } = getDateKeys();

  const todayVisits = visitsData.daily[daily] || { total: 0, unique: 0 };
  const thisWeekVisits = visitsData.weekly[weekly] || { total: 0, unique: 0 };

  return {
    total: visitsData.total,
    unique: visitsData.unique,
    today: todayVisits.total,
    todayUnique: todayVisits.unique,
    thisWeek: thisWeekVisits.total,
    thisWeekUnique: thisWeekVisits.unique,
  };
};

/**
 * Reset all visit data (admin function)
 */
export const resetVisitsData = () => {
  localStorage.removeItem(VISITS_KEY);
  localStorage.removeItem(LAST_VISIT_KEY);
  // Don't reset visitor ID to maintain uniqueness
  return initVisitsData();
};
