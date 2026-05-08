import API from "./Api";

/**
 * ============================================================================
 * OUR JOURNEY MODULE API DOCUMENTATION
 * ============================================================================
 */

// ─────────────────────────────
// STORY HERO CARD
// ─────────────────────────────

// Create a new Story Hero Card
export const saveStoryHeroCard = (data) => API.post("api/v1/ourJourney/story-hero-card/save", data);

// Update an existing Story Hero Card
export const updateStoryHeroCard = (data) => API.put("api/v1/ourJourney/story-hero-card/update", data);

// Get all Story Hero Cards
export const getAllStoryHeroCards = () => API.get("api/v1/ourJourney/story-hero-card/all");

// Get a Story Hero Card by ID
export const getStoryHeroCardById = (id) => API.get(`api/v1/ourJourney/story-hero-card/${id}`);

// Toggle Active/Inactive status for a Story Hero Card
export const toggleStoryHeroCardStatus = (id, active) => API.patch(`api/v1/ourJourney/story-hero-card/${id}/status`, null, { params: { active } });

// Delete a Story Hero Card by ID
export const deleteStoryHeroCard = (id) => API.delete(`api/v1/ourJourney/story-hero-card/${id}`);

// ─────────────────────────────
// MARQUEE
// ─────────────────────────────

// Create a new Marquee
export const saveMarquee = (data) => API.post("api/v1/ourJourney/marquee/save", data);

// Update an existing Marquee
export const updateMarquee = (data) => API.put("api/v1/ourJourney/marquee/update", data);

// Get all Marquees
export const getAllMarquees = () => API.get("api/v1/ourJourney/marquee/getAll");

// Get all active Marquees
export const getAllActiveMarquees = () => API.get("api/v1/ourJourney/marquee/getAllActive");

// Get a Marquee by ID
export const getMarqueeById = (id) => API.get(`api/v1/ourJourney/marquee/${id}`);

// Toggle Active/Inactive status for a Marquee
export const toggleMarqueeStatus = (id, active) => API.patch(`api/v1/ourJourney/marquee/toggle-active/${id}`, null, { params: { active } });

// Delete a Marquee by ID
export const deleteMarquee = (id) => API.delete(`api/v1/ourJourney/marquee/delete/${id}`);

// ─────────────────────────────
// PULL QUOTE
// ─────────────────────────────

// Create a new Pull Quote
export const savePullQuote = (data) => API.post("api/v1/ourJourney/pull-quotes/add", data);

// Update an existing Pull Quote
export const updatePullQuote = (data) => API.put("api/v1/ourJourney/pull-quotes/update", data);

// Get all Pull Quotes
export const getAllPullQuotes = () => API.get("api/v1/ourJourney/pull-quotes/all");

// Get a Pull Quote by ID
export const getPullQuoteById = (id) => API.get(`api/v1/ourJourney/pull-quotes/${id}`);

// Toggle Active/Inactive status for a Pull Quote
export const togglePullQuoteStatus = (id, active) => API.patch(`api/v1/ourJourney/pull-quotes/${id}/status`, null, { params: { active } });

// Delete a Pull Quote by ID
export const deletePullQuote = (id) => API.delete(`api/v1/ourJourney/pull-quotes/${id}`);

// ─────────────────────────────
// TEAM MEMBERS
// ─────────────────────────────

// Create a new Team Member
export const saveTeamMember = (data) => API.post("api/v1/ourJourney/team-members/add", data);

// Update an existing Team Member
export const updateTeamMember = (id, data) => API.put(`api/v1/ourJourney/team-members/${id}`, data);

// Get all Team Members
export const getAllTeamMembers = () => API.get("api/v1/ourJourney/team-members/all");

// Get a Team Member by ID
export const getTeamMemberById = (id) => API.get(`api/v1/ourJourney/team-members/${id}`);

// Toggle Active/Inactive status for a Team Member
export const toggleTeamMemberStatus = (id, active) => API.patch(`api/v1/ourJourney/team-members/${id}/status`, null, { params: { active } });

// Delete a Team Member by ID
export const deleteTeamMember = (id) => API.delete(`api/v1/ourJourney/team-members/${id}`);

// ─────────────────────────────
// STICKY CHAPTERS
// ─────────────────────────────

// Create a new Sticky Chapter
export const saveStickyChapter = (data) => API.post("api/v1/ourJourney/sticky-chapters/add", data);

// Update an existing Sticky Chapter
export const updateStickyChapter = (data) => API.put("api/v1/ourJourney/sticky-chapters/update", data);

// Get all Sticky Chapters
export const getAllStickyChapters = () => API.get("api/v1/ourJourney/sticky-chapters/all");

// Get a Sticky Chapter by ID
export const getStickyChapterById = (id) => API.get(`api/v1/ourJourney/sticky-chapters/${id}`);

// Toggle Active/Inactive status for a Sticky Chapter
export const toggleStickyChapterStatus = (id, active) => API.patch(`api/v1/ourJourney/sticky-chapters/${id}/status`, null, { params: { active } });

// Delete a Sticky Chapter by ID
export const deleteStickyChapter = (id) => API.delete(`api/v1/ourJourney/sticky-chapters/${id}`);
