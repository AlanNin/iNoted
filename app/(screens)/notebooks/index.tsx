import { StyleSheet, BackHandler } from "react-native";
import React from "react";
import {
  MotiView,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "@/components/themed";
import colors from "@/constants/colors";
import { router, useNavigation } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/loading";
import Icon from "@/components/icon";
import useColorScheme from "@/hooks/useColorScheme";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomDrawerSort from "@/components/bottom_drawer_sort";
import BottomDrawerConfirm from "@/components/bottom_drawer_confirm";
import { toast } from "@backpackapp-io/react-native-toast";
import { FlashList } from "@shopify/flash-list";
import { DrawerActions } from "@react-navigation/native";
import {
  createNotebook,
  deleteNotebook,
  deleteNotebooks,
  getAllNotebooks,
  updateNotebook,
} from "@/queries/notebooks";
import useAppConfig from "@/hooks/useAppConfig";
import { useNotebooksEditMode } from "@/hooks/useNotebooksEditMode";
import BottomDrawerCreateNotebook from "@/components/bottom_drawer_create_notebook";
import NotebookCard from "@/components/notebook_card";
import BottomDrawerNotebook from "@/components/bottom_drawer_edit_notebook";

export default function NotebooksScreen() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const navigation = useNavigation();
  const theme = useColorScheme();
  const sortBottomDrawerRef = React.useRef<BottomSheetModal>(null);
  const createNotebookBottomDrawerRef = React.useRef<BottomSheetModal>(null);
  const sortTypes = ["Recently added", "A-Z"] as const;
  const bottomDeleteMultipleDrawerRef = React.useRef<BottomSheetModal>(null);
  const [notebooksSortBy, saveNotebooksSortBy] = useAppConfig<{
    key: typeof sortTypes[number];
    order: "asc" | "desc";
  }>("notebooksSortBy", { key: sortTypes[0], order: "desc" });
  const [isFirstNotebook, saveIsFirstNotebook] = useAppConfig<boolean>(
    "isFirstNotebook",
    true
  );

  const {
    isNotebooksEditMode,
    toggleNotebooksEditMode,
    selectedNotebooks,
    setNotebooksEditMode,
  } = useNotebooksEditMode();

  const openMenu = () => {
    setNotebooksEditMode(false);
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const {
    data: notebooksData,
    isLoading: isLoadingNotebooksData,
    refetch: refetchNotebooks,
  } = useQuery({
    queryKey: ["notebooks"],
    queryFn: () => getAllNotebooks(),
  });

  const sortedNotebooks = React.useMemo(() => {
    if (!notebooksData) return [];

    const sorted = [...notebooksData];

    sorted.sort((a, b) => {
      let compareResult = 0;

      switch (notebooksSortBy.key) {
        case sortTypes[0]:
          compareResult =
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
        case sortTypes[1]:
          compareResult = a.name.localeCompare(b.name);
          break;
        default:
          compareResult = 0;
      }

      return notebooksSortBy.order === "asc" ? compareResult : -compareResult;
    });

    return sorted;
  }, [notebooksData, notebooksSortBy]);

  const filteredNoteboks = React.useMemo(() => {
    return sortedNotebooks.filter((notebook) =>
      notebook.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedNotebooks, searchQuery]);

  const handleToggleBottomNotebookDrawer = () => {
    createNotebookBottomDrawerRef.current?.present();
  };

  const handleToggleBottomSortDrawer = () => {
    sortBottomDrawerRef.current?.present();
  };

  const toggleSortOrder = (actionTitle: typeof sortTypes[number]) => {
    saveNotebooksSortBy((prevState) => {
      return {
        key: actionTitle,
        order:
          prevState?.key === actionTitle && prevState?.order === "desc"
            ? "asc"
            : "desc",
      };
    });
  };

  React.useEffect(() => {
    const backAction = () => {
      if (isNotebooksEditMode) {
        toggleNotebooksEditMode();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isNotebooksEditMode]);

  const handleToggleBottomDeleteMultipleDrawer = () => {
    bottomDeleteMultipleDrawerRef.current?.present();
  };

  const handleDeleteMultipleNotebooks = React.useCallback(async () => {
    try {
      await deleteNotebooks(selectedNotebooks);
      await refetchNotebooks();
      toggleNotebooksEditMode();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  }, [selectedNotebooks, toggleNotebooksEditMode]);

  async function handleCreateNotebook(notebook: NewNotebookProps) {
    try {
      await createNotebook(notebook);
      if (isFirstNotebook) {
        saveIsFirstNotebook(false);
      }
      await refetchNotebooks();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  }

  function handleNotebookPress(notebookId: number) {
    router.push(`notebooks/${notebookId}`);
  }

  const renderItem = ({
    item,
    index,
  }: {
    item: NotebookProps;
    index: number;
  }) => (
    <NotebookCard
      key={`${item.id}-${item.name}-${item.background}`}
      notebook={item}
      index={index}
      onPress={handleNotebookPress}
    />
  );

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View
            style={styles.searchContainer}
            customBackgroundColor={colors[theme].foggier}
          >
            <TouchableOpacity onPress={openMenu}>
              <Icon
                name="Menu"
                strokeWidth={1.8}
                size={20}
                style={{ marginTop: 1 }}
              />
            </TouchableOpacity>

            <TextInput
              style={styles.searchInput}
              placeholder="Find your notebooks..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.subHeader}>
            <Text
              style={styles.notebooksCount}
              customTextColor={colors[theme].grayscale}
            >
              All Notebooks (
              {isLoadingNotebooksData ? "..." : notebooksData?.length})
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleToggleBottomSortDrawer}
                disabled={notebooksData?.length === 0}
              >
                <Icon
                  name="ArrowDownUp"
                  size={16}
                  grayscale
                  muted={notebooksData?.length === 0}
                />
                <Text
                  style={styles.actionText}
                  customTextColor={colors[theme].grayscale}
                  disabled={notebooksData?.length === 0}
                >
                  Sort
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                disabled={notebooksData?.length === 0}
                onPress={toggleNotebooksEditMode}
              >
                <Icon
                  name={isNotebooksEditMode ? "PenOff" : "PenLine"}
                  size={16}
                  grayscale
                  muted={notebooksData?.length === 0}
                />
                <Text
                  style={styles.actionText}
                  customTextColor={colors[theme].grayscale}
                  disabled={notebooksData?.length === 0}
                >
                  {isNotebooksEditMode ? "Cancel Edit" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.content,
            { paddingBottom: isNotebooksEditMode ? 68 : 0 },
          ]}
        >
          {isLoadingNotebooksData ? (
            <View style={styles.loadingContainer}>
              <Loader />
              <Text style={styles.loadingText}>Loading notebooks...</Text>
            </View>
          ) : (
            <>
              {filteredNoteboks!.length > 0 ? (
                <FlashList
                  showsVerticalScrollIndicator={false}
                  keyExtractor={(item, index) =>
                    item.id ? item.id?.toString() : `placeholder-${index}`
                  }
                  data={filteredNoteboks}
                  renderItem={renderItem}
                  numColumns={3}
                  removeClippedSubviews={true}
                  estimatedItemSize={212}
                />
              ) : (
                <View style={styles.noNotebooksContainer}>
                  <Icon name="Microscope" size={24} strokeWidth={1} muted />
                  <Text style={styles.noNotebooksText} disabled>
                    No notebooks found
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {!isLoadingNotebooksData && !isNotebooksEditMode && (
          <View style={styles.addButtonContainer}>
            {notebooksData?.length === 0 && isFirstNotebook && (
              <Text style={styles.emptyText}>
                Let's start by creating your first{" "}
                <Text
                  style={[
                    styles.emptyTextHighlight,
                    { color: colors[theme].primary },
                  ]}
                >
                  notebook
                </Text>
              </Text>
            )}

            <MotiView
              from={{ opacity: 0 }}
              animate={{
                opacity: 1,
              }}
              transition={{
                type: "timing",
                duration: 200,
              }}
              style={styles.fabContainer}
            >
              {notebooksData?.length === 0 && isFirstNotebook && (
                <Icon name="Spline" themed size={36} style={styles.spline} />
              )}
              <TouchableOpacity
                style={styles.fab}
                customBackgroundColor={colors[theme].primary}
                onPress={handleToggleBottomNotebookDrawer}
              >
                <Icon name="Plus" size={28} customColor={colors.dark.tint} />
              </TouchableOpacity>
            </MotiView>
          </View>
        )}

        {isNotebooksEditMode && (
          <MotiView
            style={[
              styles.editMenuContainer,
              { borderTopColor: colors[theme].foggier },
            ]}
            customBackgroundColor={colors[theme].background}
            from={{ opacity: 0, translateY: 10 }}
            animate={{
              opacity: 1,
              translateY: 0,
            }}
            transition={{
              type: "timing",
              duration: 250,
            }}
          >
            <TouchableOpacity
              style={styles.editMenuButton}
              onPress={handleToggleBottomDeleteMultipleDrawer}
              disabled={selectedNotebooks.length === 0}
            >
              <Icon
                name="Eraser"
                size={24}
                strokeWidth={1}
                muted={selectedNotebooks.length === 0}
              />
              <Text
                style={styles.editMenuButtonText}
                customTextColor={colors[theme].text}
                disabled={selectedNotebooks.length === 0}
              >
                Delete
              </Text>
            </TouchableOpacity>
          </MotiView>
        )}
      </SafeAreaView>
      <BottomDrawerSort
        ref={sortBottomDrawerRef}
        title="Sort your notebooks"
        actions={sortTypes.map((type) => ({
          title: type,
          action: () => toggleSortOrder(type),
          isSelected: notebooksSortBy.key === type,
          order: notebooksSortBy.order,
        }))}
      />

      <BottomDrawerCreateNotebook
        ref={createNotebookBottomDrawerRef}
        title="New notebook"
        description="Create a notebook to organize your notes."
        onSubmit={handleCreateNotebook}
      />

      <BottomDrawerConfirm
        ref={bottomDeleteMultipleDrawerRef}
        title={`Delete selected ${
          selectedNotebooks.length > 1 ? "notebooks" : "notebook"
        }?`}
        description={`This ${
          selectedNotebooks.length > 1 ? "notebooks" : "notebook"
        } will be permanently deleted from this device. You have selected ${
          selectedNotebooks.length
        } ${selectedNotebooks.length > 1 ? "notebooks" : "notebook"}.`}
        submitButtonText="Delete"
        onSubmit={handleDeleteMultipleNotebooks}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: "100%",
  },
  header: {
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    height: 48,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 28,
  },

  settingsButton: {
    borderRadius: 20,
    padding: 8,
    marginLeft: 4,
  },
  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notebooksCount: {
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 4,
  },
  actionText: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 8,
  },
  emptyText: {
    paddingHorizontal: 8,
    letterSpacing: 0.5,
    maxWidth: 320,
  },
  emptyTextHighlight: {
    letterSpacing: 0.5,
  },
  addButtonContainer: {
    position: "absolute",
    bottom: 32,
    right: 32,
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 20,
  },
  fabContainer: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "transparent",
    gap: 20,
  },
  spline: {
    transform: [{ rotate: "270deg" }],
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    gap: 12,
    marginBottom: "30%",
  },
  loadingText: {
    fontSize: 16,
    alignSelf: "center",
  },
  noNotebooksContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    gap: 12,
    marginBottom: "30%",
  },
  noNotebooksText: {
    fontSize: 16,
    alignSelf: "center",
  },
  scrollButtonContainer: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
  },
  scrollButtonIcon: {
    padding: 4,
    borderRadius: 9999,
  },
  editMenuContainer: {
    position: "absolute",
    width: "100%",
    bottom: 0,
    height: 68,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    elevation: 12,
  },
  editMenuButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: 4,
    margin: "auto",
  },
  editMenuButtonText: {
    fontSize: 12,
  },
});
