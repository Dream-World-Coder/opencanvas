import PropTypes from "prop-types";
import { createContext, useContext, useState, useEffect } from "react";

import { useAuth } from "./AuthContext";

const CollectionContext = createContext();

export const CollectionContextProvider = ({ children }) => {
  const [postIdToAdd, setPostIdToAdd] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!postIdToAdd) return;
    setIsModalOpen(true);
  }, [postIdToAdd]);

  const CollectionChoiceModal = () => {
    const { currentUser } = useAuth();
    const collectionIds = currentUser.collections;
    return isModalOpen && <div></div>;
  };

  const value = { setPostIdToAdd, CollectionChoiceModal };

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};
CollectionContextProvider.propTypes = { children: PropTypes.node.isRequired };

export const useCollectionContext = () => {
  return useContext(CollectionContext);
};
