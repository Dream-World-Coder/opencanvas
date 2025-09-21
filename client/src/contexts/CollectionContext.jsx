import { createContext, useContext, useState, useEffect } from "react";
import { Plus, X, Check, Save, Loader2, Tag, Library } from "lucide-react";
import PropTypes from "prop-types";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [savingToCollections, setSavingToCollections] = useState(false);

  const [newCollectionData, setNewCollectionData] = useState({
    title: "",
    description: "",
    tags: [],
    isPrivate: false,
  });
  const [tagInput, setTagInput] = useState("");
  const [creatingCollection, setCreatingCollection] = useState(false);

  const { addPostToCollection, getUserCollections, createCollection } =
    useDataService();

  // fetch collections
  useEffect(() => {
    if (!currentUser?._id) return;

    async function loadCollections() {
      try {
        setLoading(true);
        const data = await getUserCollections(currentUser._id);
        setCollections(data || []);
      } catch (error) {
        console.log(error);
        // toast.error("Failed to load collections");
      } finally {
        setLoading(false);
      }
    }

    loadCollections();
  }, [currentUser]);

  // trigger modal if postId present
  useEffect(() => {
    if (!postIdToSave) return;
    setIsModalOpen(true);
  }, [postIdToSave]);

  async function handleSavePost() {
    if (collectionsToSave.length === 0) {
      toast.error("Please select at least one collection");
      return;
    }

    try {
      let savedCtn = 0;
      setSavingToCollections(true);

      // instead of loop, have to make a different route to do this at one req, for better perf
      for (const collectionId of collectionsToSave) {
        try {
          await addPostToCollection(collectionId, postIdToSave);
          savedCtn += 1;
        } catch {
          continue;
        }
      }

      toast.success(`Post saved to ${savedCtn} collection(s)`, {
        action: {
          label: "close",
          onClick: () => {
            console.log("close");
          },
        },
      });

      // Reset states
      setCollectionsToSave([]);
      setPostIdToSave(null);
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
      // toast.error("Failed to save post to collections");
    } finally {
      setSavingToCollections(false);
    }
  }

  async function handleCreateCollection() {
    if (!newCollectionData.title.trim()) {
      toast.error("Collection title is required");
      return;
    }

    try {
      setCreatingCollection(true);
      const response = await createCollection(newCollectionData);

      if (response.success) {
        const newCollection = response.collection;
        setCollections((prev) => [newCollection, ...prev]);

        // Auto-select the new collection and add current post if exists
        if (postIdToSave) {
          setCollectionsToSave([newCollection._id]);
          setIsCreatingNewColl(false);
          setIsModalOpen(true);
        } else {
          setIsCreatingNewColl(false);
        }

        // Reset form
        setNewCollectionData({
          title: "",
          description: "",
          tags: [],
          isPrivate: false,
        });
        setTagInput("");

        toast.success("Collection created successfully", {
          action: {
            label: "close",
            onClick: () => {
              console.log("close");
            },
          },
        });
      }
    } catch (error) {
      console.log(error);
      // toast.error("Failed to create collection");
    } finally {
      setCreatingCollection(false);
    }
  }

  const handleAddTag = () => {
    if (!tagInput.trim()) return;

    if (newCollectionData.tags.length >= 5) {
      toast.error("Maximum 5 tags allowed");
      return;
    }

    if (newCollectionData.tags.includes(tagInput.trim())) {
      toast.error("Tag already exists");
      return;
    }

    setNewCollectionData((prev) => ({
      ...prev,
      tags: [...prev.tags, `${tagInput.trim()}`],
    }));
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewCollectionData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const toggleCollectionSelection = (collectionId) => {
    setCollectionsToSave((prev) => {
      if (prev.includes(collectionId)) {
        return prev.filter((id) => id !== collectionId);
      } else {
        return [...prev, collectionId];
      }
    });
  };

  function CollectionChoiceModal() {
    if (!isModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {collections.length > 0
                ? "Save to Collection"
                : "Create Your First Collection"}
            </h2>
            <button
              onClick={() => {
                setIsModalOpen(false);
                setPostIdToSave(null);
                setCollectionsToSave([]);
              }}
              className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="h-5 w-5 text-neutral-500" />
            </button>
          </div>

          {/* Collections List */}
          <div className="p-4 max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-lime-500" />
              </div>
            ) : collections.length > 0 ? (
              <div className="space-y-2">
                {collections.map((collection) => (
                  <div
                    key={collection._id}
                    onClick={() => toggleCollectionSelection(collection._id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      collectionsToSave.includes(collection._id)
                        ? "bg-lime-100 dark:bg-lime-950/20 border-0"
                        : "bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 border-0"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-neutral-900 dark:text-white">
                          {collection.title}
                        </h3>

                        <div className="flex items-center gap-2 mt-2">
                          {/* <span className="text-xs text-neutral-500">
                            {collection.posts?.length || 0} articles
                          </span>*/}
                          {collection.isPrivate && (
                            <span className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-full">
                              Private
                            </span>
                          )}
                        </div>
                      </div>

                      {collectionsToSave.includes(collection._id) && (
                        <Check className="h-5 w-5 text-lime-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Library className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600 dark:text-neutral-400">
                  You don&apos;t have any collections yet
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 space-y-3">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setIsCreatingNewColl(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-full text-white dark:text-black bg-black dark:bg-white transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create New Collection
            </button>

            {collectionsToSave.length > 0 && (
              <button
                onClick={handleSavePost}
                disabled={savingToCollections}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-green-600 disabled:bg-lime-400 text-white rounded-full transition-colors"
              >
                {savingToCollections ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save to {collectionsToSave.length} Collection
                {collectionsToSave.length > 1 ? "s" : ""}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  function NewCollectionModal() {
    // use its ows state & sync on save, then focus will be present
    const handleTitleChange = (e) => {
      setNewCollectionData((prev) => ({
        ...prev,
        title: e.target.value,
      }));
    };

    const handleDescriptionChange = (e) => {
      setNewCollectionData((prev) => ({
        ...prev,
        description: e.target.value,
      }));
    };

    const handleTagInputChange = (e) => {
      setTagInput(e.target.value);
    };

    const handlePrivateChange = (checked) => {
      setNewCollectionData((prev) => ({
        ...prev,
        isPrivate: checked,
      }));
    };

    const handleCloseModal = () => {
      setIsCreatingNewColl(false);
      if (postIdToSave) {
        setIsModalOpen(true);
      }
    };

    if (!isCreatingNewColl) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full">
          {/* header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Create New Collection
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseModal}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* forms */}
          <div className="p-6 space-y-4">
            {/* title */}
            <div className="space-y-2">
              <Label htmlFor="collection-title">Title *</Label>
              <Input
                id="collection-title"
                type="text"
                required
                value={newCollectionData.title}
                onChange={handleTitleChange}
                placeholder="Enter collection title"
                className="focus:ring-lime-500 focus:border-lime-500"
              />
            </div>

            {/* description */}
            <div className="space-y-2">
              <Label htmlFor="collection-description">Description</Label>
              <Textarea
                id="collection-description"
                value={newCollectionData.description}
                onChange={handleDescriptionChange}
                placeholder="Describe your collection (optional)"
                rows={3}
                className="resize-none focus:ring-lime-500 focus:border-lime-500"
              />
            </div>

            {/* tags */}
            <div className="space-y-2">
              <Label>Tags ({newCollectionData.tags.length}/5)</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  placeholder="Add a tag"
                  className="flex-1 focus:ring-lime-500 focus:border-lime-500"
                />
                <Button
                  onClick={handleAddTag}
                  disabled={
                    !tagInput.trim() || newCollectionData.tags.length >= 5
                  }
                  size="icon"
                  className="bg-lime-600 hover:bg-lime-700"
                >
                  <Tag className="h-4 w-4" />
                </Button>
              </div>

              {/* tag List */}
              {newCollectionData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newCollectionData.tags.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-lime-100 dark:bg-lime-950/30 text-lime-800 dark:text-lime-300 text-xs rounded-full"
                    >
                      {tag}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTag(tag)}
                        className="h-3 w-3 p-0 hover:text-lime-900 dark:hover:text-lime-200"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* isPrivate */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-private"
                checked={newCollectionData.isPrivate}
                onCheckedChange={handlePrivateChange}
                className="border-neutral-300 data-[state=checked]:bg-lime-600 data-[state=checked]:border-lime-600"
              />
              <Label
                htmlFor="is-private"
                className="text-sm text-neutral-700 dark:text-neutral-300"
              >
                Make this collection private
              </Label>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex gap-3 justify-end">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateCollection}
              disabled={!newCollectionData.title.trim() || creatingCollection}
              className="bg-lime-600 hover:bg-lime-700"
            >
              {creatingCollection ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {postIdToSave ? "Create & Save Post" : "Create Collection"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const refreshCollections = async () => {
    if (!currentUser?._id) return;

    try {
      setLoading(true);
      const data = await getUserCollections(currentUser._id);
      setCollections(data || []);
    } catch (error) {
      console.log(error);
      // toast.error("Failed to refresh collections");
    } finally {
      setLoading(false);
    }
  };

  const value = {
    collections,
    loading,

    // func
    setPostIdToSave,
    refreshCollections,

    // modals
    CollectionChoiceModal,
    NewCollectionModal,
  };

  return (
    <CollectionContext.Provider value={value}>
      {children}
      <CollectionChoiceModal />
      <NewCollectionModal />
    </CollectionContext.Provider>
  );
};

CollectionContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useCollectionContext = () => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error(
      "useCollectionContext must be used within a CollectionContextProvider",
    );
  }
  return context;
};
