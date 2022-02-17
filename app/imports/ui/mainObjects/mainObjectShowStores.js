import { writable } from "svelte/store";

//source or highlight links in loaded feedback objects - each looks like {sourceId (str), highlightId (str) (optional)}
export const feedbackLinks = writable([]);

//loaded sources - each looks like {sourceId (str), sourceTitle (str)}
export const availableSources = writable([]);

//what source, if any, is currently expanded - looks like {sourceId (str), highlightMode (bool)},
export const expandedSource = writable({});

//what highlight, if any, is currently being emphasized (scrolled to and color changed) - looks like highlightId (str)
export const emphasizedHighlight = writable("");

//what is the new highlight being created to link into a feedback object - looks like highlightId (str)
export const newHighlight = writable("");

//info for new feedback object being created - looks like {subtype (str), targetType(str), targetId (str), targetName (str), targetVersion (int)}
export const newFeedback = writable({});

//what field, if any, is currently being emphasized (scrolled to and color changded) - looks like fieldName (str)
export const emphasizedField = writable("");
