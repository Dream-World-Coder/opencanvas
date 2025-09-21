import PropTypes from "prop-types";
import { createContext, useContext, useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "./AuthContext";
import { useDataService } from "../services/dataService";

const CollectionContext = createContext();

export const CollectionContextProvider = ({ children }) => {
  // create/add related
  const { currentUser } = useAuth();

  const [postIdToSave, setPostIdToSave] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingNewColl, setIsCreatingNewColl] = useState(false);

  const [collections, setCollections] = useState([]);
  const [collectionsToSave, setCollectionsToSave] = useState([]);

  const [loading, setLoading] = useState(false);

  const { addPostToCollection, getUserCollections, createCollection } =
    useDataService();

  // fetch collections
  useEffect(() => {
    async function loadCollections() {
      const data = await getUserCollections(currentUser._id);
      setCollections(data.collections);
      toast("");
    }
    loadCollections();
  }, []);

  // trigger modal if postId +nt
  useEffect(() => {
    if (!postIdToSave) return;
    setIsModalOpen(true);
  }, [postIdToSave]);

  async function handleSavePost() {
    (collectionsToSave, postIdToSave);
    addPostToCollection;
    // finally after saving setCollectionsToSave([])
  }

  const CollectionChoiceModal = () => {
    return (
      isModalOpen && (
        <div>
          <header>
            {collections.length > 0 ? (
              <h1>Select a collection</h1>
            ) : (
              <h1>you dont have any collections, create one</h1>
            )}

            {/* close */}
            <button>Close</button>
          </header>

          {/* collections */}
          <div className="">
            {collections.map((collection) => (
              <ul key={collection._id}>
                <li
                  onClick={() => {
                    setCollectionsToSave((p) => [...p, collection._id]);
                  }}
                >
                  {collection.title}
                </li>
              </ul>
            ))}
          </div>

          {/* create new */}
          <button
            onClick={() => {
              setIsModalOpen(false);
              setIsCreatingNewColl(true);
            }}
          >
            <Plus /> Create
          </button>

          {/* save btn */}
          <button
            onClick={async () => {
              await handleSavePost();
            }}
          >
            Save
          </button>
        </div>
      )
    );
  };

  const NewCollectionModal = () => {
    // create collection & save post there
    // setCollectionsToSave([...newId])
    async function handleCreate() {
      createCollection;
    }
    return isCreatingNewColl && <div></div>;
  };

  // read context manager, like first 20 posts / articles fetched, then will fetch next 20 if scrolled
  const [fetchedArticles, setFetchedArticles] = useState([]);

  const value = { setPostIdToSave, CollectionChoiceModal, NewCollectionModal };

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
