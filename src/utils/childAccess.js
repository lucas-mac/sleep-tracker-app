export const hasChildAccess = (children, childId) => {
	if (!childId || !Array.isArray(children)) return false;
	return children.some((child) => child.id === childId);
};

export const requireEntryAccess = async ({entrySnap, children, showToast, navigate, redirectTo, selectChild, activeChildId, syncActiveChild = false, message = "You do not have access to this entry."}) => {
	const exists = typeof entrySnap?.exists === "function" && entrySnap.exists();
	const childId = exists ? entrySnap.data()?.child_id : null;

	if (!exists || !hasChildAccess(children, childId)) {
		await showToast(message, "danger");
		navigate(redirectTo);
		return false;
	}

	if (syncActiveChild && childId && childId !== activeChildId && typeof selectChild === "function") {
		selectChild(childId);
	}

	return true;
};
