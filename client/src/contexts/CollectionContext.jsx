// client/src/contexts/CollectionContext.jsx
// Provides collection state and two modals (save-to-collection, create-collection)
// that can be triggered from anywhere in the app via context.

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
  const { currentUser } = useAuth();
  const { getUserCollections, createCollection, togglePostInCollection } =
    useDataService();

  // ::::: State :::::

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);

  // postIdToSave: set from anywhere to open the save-to-collection modal
  const [postIdToSave, setPostIdToSave] = useState(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState([]);
  const [saving, setSaving] = useState(false);

  // isCreatingNewColl: set to true to open the create-collection modal
  const [isCreatingNewColl, setIsCreatingNewColl] = useState(false);
  const [newCollForm, setNewCollForm] = useState({
    title: "",
    description: "",
    tags: [],
    isPrivate: false,
  });
  const [tagInput, setTagInput] = useState("");
  const [creating, setCreating] = useState(false);

  // ::::: Load user's collections on login :::::

  useEffect(() => {
    if (!currentUser?._id) return;

    async function load() {
      try {
        setLoading(true);
        const data = await getUserCollections(currentUser._id);
        setCollections(data || []);
      } catch {
        // dataService already shows a toast
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [currentUser]);

  // Open the save modal whenever a postId is set
  useEffect(() => {
    if (postIdToSave) setIsSaveModalOpen(true);
  }, [postIdToSave]);

  // ::::: Refresh helper (call after create/delete) :::::

  const refreshCollections = async () => {
    if (!currentUser?._id) return;
    try {
      setLoading(true);
      const data = await getUserCollections(currentUser._id);
      setCollections(data || []);
    } catch {
      // handled by dataService
    } finally {
      setLoading(false);
    }
  };

  // ::::: Save post to selected collections :::::

  const handleSavePost = async () => {
    if (selectedCollectionIds.length === 0) {
      toast.error("Select at least one collection");
      return;
    }

    setSaving(true);
    let savedCount = 0;

    for (const collectionId of selectedCollectionIds) {
      try {
        await togglePostInCollection(postIdToSave, collectionId);
        savedCount++;
      } catch {
        // skip failed ones, keep going
      }
    }

    toast.success(`Saved to ${savedCount} collection(s)`);

    // Reset modal state
    setSelectedCollectionIds([]);
    setPostIdToSave(null);
    setIsSaveModalOpen(false);
    setSaving(false);
  };

  const toggleCollectionSelection = (id) => {
    setSelectedCollectionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // ::::: Create new collection :::::

  const handleCreateCollection = async () => {
    if (!newCollForm.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      setCreating(true);
      // dataService.createCollection returns res.data.data (the new collection object)
      const newCollection = await createCollection(newCollForm);
      setCollections((prev) => [newCollection, ...prev]);

      // If we came from the save modal, auto-select the new collection and go back
      if (postIdToSave) {
        setSelectedCollectionIds([newCollection._id]);
        setIsCreatingNewColl(false);
        setIsSaveModalOpen(true);
      } else {
        setIsCreatingNewColl(false);
      }

      // Reset form
      setNewCollForm({
        title: "",
        description: "",
        tags: [],
        isPrivate: false,
      });
      setTagInput("");
      toast.success("Collection created");
    } catch {
      // handled by dataService
    } finally {
      setCreating(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;
    if (newCollForm.tags.length >= 5) {
      toast.error("Maximum 5 tags");
      return;
    }
    if (newCollForm.tags.includes(tag)) {
      toast.error("Tag already added");
      return;
    }
    setNewCollForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    setTagInput("");
  };

  const handleRemoveTag = (tag) => {
    setNewCollForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // ::::: Close helpers :::::

  const closeSaveModal = () => {
    setIsSaveModalOpen(false);
    setPostIdToSave(null);
    setSelectedCollectionIds([]);
  };

  const closeCreateModal = () => {
    setIsCreatingNewColl(false);
    // If there's still a post waiting to be saved, re-open save modal
    if (postIdToSave) setIsSaveModalOpen(true);
  };

  // ::::: Context value :::::

  return (
    <CollectionContext.Provider
      value={{
        collections,
        loading,
        setPostIdToSave, // trigger save modal from any component
        setIsCreatingNewColl, // trigger create modal from any component
        refreshCollections,
      }}
    >
      {children}

      {/* Save-to-collection modal — inline JSX, not a nested component function.
          Nested component functions re-mount on every render and lose focus. */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Save to Collection
              </h2>
              <button
                onClick={closeSaveModal}
                className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="h-5 w-5 text-neutral-500" />
              </button>
            </div>

            {/* Collection list */}
            <div className="p-4 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-lime-500" />
                </div>
              ) : collections.length === 0 ? (
                <div className="text-center py-8">
                  <Library className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                  <p className="text-neutral-600 dark:text-neutral-400">
                    No collections yet
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {collections.map((collection) => {
                    const isSelected = selectedCollectionIds.includes(
                      collection._id,
                    );
                    return (
                      <div
                        key={collection._id}
                        onClick={() =>
                          toggleCollectionSelection(collection._id)
                        }
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-lime-100 dark:bg-lime-950/20"
                            : "bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-white">
                              {collection.title}
                            </p>
                            {collection.isPrivate && (
                              <span className="text-xs text-neutral-500">
                                Private
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <Check className="h-5 w-5 text-lime-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 space-y-3">
              {/* Open create modal (pauses save flow) */}
              <button
                onClick={() => {
                  setIsSaveModalOpen(false);
                  setIsCreatingNewColl(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-black text-white dark:bg-white dark:text-black transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create New Collection
              </button>

              {selectedCollectionIds.length > 0 && (
                <button
                  onClick={handleSavePost}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-lime-600 disabled:opacity-60 text-white rounded-full transition-colors"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save to {selectedCollectionIds.length} Collection
                  {selectedCollectionIds.length > 1 ? "s" : ""}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create-collection modal — also inline for the same reason */}
      {isCreatingNewColl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                New Collection
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeCreateModal}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="coll-title">Title *</Label>
                <Input
                  id="coll-title"
                  value={newCollForm.title}
                  onChange={(e) =>
                    setNewCollForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Collection title"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="coll-desc">Description</Label>
                <Textarea
                  id="coll-desc"
                  value={newCollForm.description}
                  onChange={(e) =>
                    setNewCollForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Optional description"
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags ({newCollForm.tags.length}/5)</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                    placeholder="Add a tag"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || newCollForm.tags.length >= 5}
                    size="icon"
                    className="bg-lime-600 hover:bg-lime-700"
                  >
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>

                {newCollForm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newCollForm.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-lime-100 dark:bg-lime-950/30 text-lime-800 dark:text-lime-300 text-xs rounded-full"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-lime-900 dark:hover:text-lime-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Private toggle */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="coll-private"
                  checked={newCollForm.isPrivate}
                  onCheckedChange={(checked) =>
                    setNewCollForm((prev) => ({ ...prev, isPrivate: checked }))
                  }
                  className="border-neutral-300 data-[state=checked]:bg-lime-600 data-[state=checked]:border-lime-600"
                />
                <Label htmlFor="coll-private" className="text-sm">
                  Make private
                </Label>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex gap-3 justify-end">
              <Button variant="outline" onClick={closeCreateModal}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateCollection}
                disabled={!newCollForm.title.trim() || creating}
                className="bg-lime-600 hover:bg-lime-700"
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {postIdToSave ? "Create & Save" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
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
