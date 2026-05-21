import React, {createContext, useContext, useEffect, useState} from "react";
import {collection, getDocs, orderBy, query, where} from "firebase/firestore";
import {db} from "../firebase";

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
			const childrenQuery = query(collection(db, "child"));
			const querySnapshot = await getDocs(childrenQuery);

			if (querySnapshot.empty) {
				setChildrenList([]);
				setActiveChildId(null);
				return;
			}

			const loadedChildren = querySnapshot.docs.map((childDoc) => ({
				id: childDoc.id,
				...childDoc.data(),
			}));

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
		refreshChildren();
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
