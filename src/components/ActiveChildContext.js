import React, {createContext, useContext, useEffect, useState} from "react";
import {collection, getDocs, orderBy, query, where} from "firebase/firestore";
import {onAuthStateChanged} from "firebase/auth";
import {db, auth} from "../firebase";

const ActiveChildContext = createContext(null);
const STORAGE_KEY = "ST_activeChildId";

export const ActiveChildProvider = ({children}) => {
	const [childrenList, setChildrenList] = useState([]);
	const [activeChildId, setActiveChildId] = useState(() => {
		return localStorage.getItem(STORAGE_KEY) || null;
	});
	const [loadingChildren, setLoadingChildren] = useState(true);

	const refreshChildren = async () => {
		setLoadingChildren(true);
		try {
			const user = auth.currentUser;
			if (!user) {
				setChildrenList([]);
				setActiveChildId(null);
				return;
			}

			const ownedChildrenQuery = query(collection(db, "child"), where("guardian", "==", user.uid));
			const sharedChildrenQuery = query(collection(db, "child"), where("shared_with", "array-contains", user.uid));
			const [ownedResult, sharedResult] = await Promise.allSettled([getDocs(ownedChildrenQuery), getDocs(sharedChildrenQuery)]);

			const ownedDocs = ownedResult.status === "fulfilled" ? ownedResult.value.docs : [];
			const sharedDocs = sharedResult.status === "fulfilled" ? sharedResult.value.docs : [];

			if (ownedResult.status === "rejected") {
				console.error("Error fetching owned children:", ownedResult.reason);
			}
			if (sharedResult.status === "rejected") {
				console.error("Error fetching shared children:", sharedResult.reason);
			}

			const childDocs = [...ownedDocs, ...sharedDocs];

			if (childDocs.length === 0) {
				setChildrenList([]);
				setActiveChildId(null);
				return;
			}

			const childMap = new Map();
			childDocs.forEach((childDoc) => {
				if (!childMap.has(childDoc.id)) {
					childMap.set(childDoc.id, {
						id: childDoc.id,
						...childDoc.data(),
					});
				}
			});
			const loadedChildren = Array.from(childMap.values());

			setChildrenList(loadedChildren);

			setActiveChildId((currentId) => {
				if (currentId && loadedChildren.some((child) => child.id === currentId)) {
					return currentId;
				}
				return loadedChildren[0].id;
			});
		} catch (error) {
			console.error("Error fetching child data:", error);
		} finally {
			setLoadingChildren(false);
		}
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, () => {
			refreshChildren();
		});
		return unsubscribe;
	}, []);

	const selectChild = (childOrId) => {
		if (!childOrId) return;
		const nextId = typeof childOrId === "string" ? childOrId : childOrId.id;
		if (!nextId) return;
		setActiveChildId(nextId);
	};

	const activeChild = childrenList.find((child) => child.id === activeChildId) || null;

	useEffect(() => {
		if (activeChildId) {
			localStorage.setItem(STORAGE_KEY, activeChildId);
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	}, [activeChildId]);

	return (
		<ActiveChildContext.Provider
			value={{
				children: childrenList,
				activeChildId,
				activeChild,
				loadingChildren,
				setActiveChildId,
				selectChild,
				refreshChildren,
			}}
		>
			{children}
		</ActiveChildContext.Provider>
	);
};

export const useActiveChild = () => {
	const ctx = useContext(ActiveChildContext);
	if (!ctx) throw new Error("useActiveChild must be used inside ActiveChildProvider");
	return ctx;
};
