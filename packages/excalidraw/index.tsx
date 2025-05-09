import React, { useEffect } from "react";

import { DEFAULT_UI_OPTIONS, isShallowEqual } from "@excalidraw/common";

import App from "./components/App";
import { InitializeApp } from "./components/InitializeApp";
import Footer from "./components/footer/FooterCenter";
import LiveCollaborationTrigger from "./components/live-collaboration/LiveCollaborationTrigger";
import MainMenu from "./components/main-menu/MainMenu";
import WelcomeScreen from "./components/welcome-screen/WelcomeScreen";
import { EditorJotaiProvider, editorJotaiStore } from "./editor-jotai";
import { defaultLang } from "./i18n";
import polyfill from "./polyfill";

import "./css/app.scss";
import "./css/styles.scss";
import "./fonts/fonts.css";

import type { AppProps, ExcalidrawProps } from "./types";

polyfill();

const ExcalidrawBase = (props: ExcalidrawProps) => {
  const {
    onChange,
    initialData,
    excalidrawAPI,
    isCollaborating = false,
    onPointerUpdate,
    renderTopRightUI,
    langCode = defaultLang.code,
    viewModeEnabled,
    zenModeEnabled,
    gridModeEnabled,
    libraryReturnUrl,
    theme,
    name,
    renderCustomStats,
    onPaste,
    detectScroll = true,
    handleKeyboardGlobally = false,
    onLibraryChange,
    autoFocus = false,
    generateIdForFile,
    onLinkOpen,
    generateLinkForSelection,
    onPointerDown,
    onPointerUp,
    onScrollChange,
    onDuplicate,
    children,
    validateEmbeddable,
    renderEmbeddable,
    aiEnabled,
    showDeprecatedFonts,
    renderScrollbars,
  } = props;

  const canvasActions = props.UIOptions?.canvasActions;

  // FIXME normalize/set defaults in parent component so that the memo resolver
  // compares the same values
  const UIOptions: AppProps["UIOptions"] = {
    ...props.UIOptions,
    canvasActions: {
      ...DEFAULT_UI_OPTIONS.canvasActions,
      ...canvasActions,
    },
    tools: {
      image: props.UIOptions?.tools?.image ?? true,
    },
  };

  if (canvasActions?.export) {
    UIOptions.canvasActions.export.saveFileToDisk =
      canvasActions.export?.saveFileToDisk ??
      DEFAULT_UI_OPTIONS.canvasActions.export.saveFileToDisk;
  }

  if (
    UIOptions.canvasActions.toggleTheme === null &&
    typeof theme === "undefined"
  ) {
    UIOptions.canvasActions.toggleTheme = true;
  }

  useEffect(() => {
    const importPolyfill = async () => {
      //@ts-ignore
      await import("canvas-roundrect-polyfill");
    };

    importPolyfill();

    // Block pinch-zooming on iOS outside of the content area
    const handleTouchMove = (event: TouchEvent) => {
      // @ts-ignore
      if (typeof event.scale === "number" && event.scale !== 1) {
        event.preventDefault();
      }
    };

    document.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <EditorJotaiProvider store={editorJotaiStore}>
      <InitializeApp langCode={langCode} theme={theme}>
        <App
          onChange={onChange}
          initialData={initialData}
          excalidrawAPI={excalidrawAPI}
          isCollaborating={isCollaborating}
          onPointerUpdate={onPointerUpdate}
          renderTopRightUI={renderTopRightUI}
          langCode={langCode}
          viewModeEnabled={viewModeEnabled}
          zenModeEnabled={zenModeEnabled}
          gridModeEnabled={gridModeEnabled}
          libraryReturnUrl={libraryReturnUrl}
          theme={theme}
          name={name}
          renderCustomStats={renderCustomStats}
          UIOptions={UIOptions}
          onPaste={onPaste}
          detectScroll={detectScroll}
          handleKeyboardGlobally={handleKeyboardGlobally}
          onLibraryChange={onLibraryChange}
          autoFocus={autoFocus}
          generateIdForFile={generateIdForFile}
          onLinkOpen={onLinkOpen}
          generateLinkForSelection={generateLinkForSelection}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onScrollChange={onScrollChange}
          onDuplicate={onDuplicate}
          validateEmbeddable={validateEmbeddable}
          renderEmbeddable={renderEmbeddable}
          aiEnabled={aiEnabled !== false}
          showDeprecatedFonts={showDeprecatedFonts}
          renderScrollbars={renderScrollbars}
        >
          {children}
        </App>
      </InitializeApp>
    </EditorJotaiProvider>
  );
};

const areEqual = (prevProps: ExcalidrawProps, nextProps: ExcalidrawProps) => {
  // short-circuit early
  if (prevProps.children !== nextProps.children) {
    return false;
  }

  const {
    initialData: prevInitialData,
    UIOptions: prevUIOptions = {},
    ...prev
  } = prevProps;
  const {
    initialData: nextInitialData,
    UIOptions: nextUIOptions = {},
    ...next
  } = nextProps;

  // comparing UIOptions
  const prevUIOptionsKeys = Object.keys(prevUIOptions) as (keyof Partial<
    typeof DEFAULT_UI_OPTIONS
  >)[];
  const nextUIOptionsKeys = Object.keys(nextUIOptions) as (keyof Partial<
    typeof DEFAULT_UI_OPTIONS
  >)[];

  if (prevUIOptionsKeys.length !== nextUIOptionsKeys.length) {
    return false;
  }

  const isUIOptionsSame = prevUIOptionsKeys.every((key) => {
    if (key === "canvasActions") {
      const canvasOptionKeys = Object.keys(
        prevUIOptions.canvasActions!,
      ) as (keyof Partial<typeof DEFAULT_UI_OPTIONS.canvasActions>)[];
      return canvasOptionKeys.every((key) => {
        if (
          key === "export" &&
          prevUIOptions?.canvasActions?.export &&
          nextUIOptions?.canvasActions?.export
        ) {
          return (
            prevUIOptions.canvasActions.export.saveFileToDisk ===
            nextUIOptions.canvasActions.export.saveFileToDisk
          );
        }
        return (
          prevUIOptions?.canvasActions?.[key] ===
          nextUIOptions?.canvasActions?.[key]
        );
      });
    }
    return prevUIOptions[key] === nextUIOptions[key];
  });

  return isUIOptionsSame && isShallowEqual(prev, next);
};

export const Excalidraw = React.memo(ExcalidrawBase, areEqual);
Excalidraw.displayName = "Excalidraw";

export {
  getNonDeletedElements,
  getSceneVersion,
  hashElementsVersion,
  hashString,
} from "@excalidraw/element";

export { isInvisiblySmallElement } from "@excalidraw/element/sizeHelpers";
export { getTextFromElements } from "@excalidraw/element/textElement";

export {
  restore,
  restoreAppState,
  restoreElements,
  restoreLibraryItems,
} from "./data/restore";
export { defaultLang, languages, useI18n } from "./i18n";

export { reconcileElements } from "./data/reconcile";

export {
  exportToBlob,
  exportToCanvas,
  exportToClipboard,
  exportToSvg,
} from "@excalidraw/utils/export";

export { getFreeDrawSvgPath } from "@excalidraw/element/renderElement";
export { isLinearElement } from "@excalidraw/element/typeChecks";
export {
  loadFromBlob,
  loadLibraryFromBlob,
  loadSceneOrLibraryFromBlob,
} from "./data/blob";
export { serializeAsJSON, serializeLibraryAsJSON } from "./data/json";
export { getLibraryItemsHash, mergeLibraryItems } from "./data/library";

export {
  DEFAULT_LASER_COLOR,
  FONT_FAMILY,
  MIME_TYPES,
  normalizeLink,
  ROUNDNESS,
  THEME,
  UserIdleState,
} from "@excalidraw/common";

export {
  bumpVersion,
  mutateElement,
  newElementWith,
} from "@excalidraw/element/mutateElement";

export { CaptureUpdateAction } from "./store";

export { parseLibraryTokensFromUrl, useHandleLibrary } from "./data/library";

export {
  sceneCoordsToViewportCoords,
  viewportCoordsToSceneCoords,
} from "@excalidraw/common";

export { useDevice } from "./components/App";
export { Button } from "./components/Button";
export { Sidebar } from "./components/Sidebar/Sidebar";
export { Stats } from "./components/Stats";
export { Footer, LiveCollaborationTrigger, MainMenu, WelcomeScreen };

export { DefaultSidebar } from "./components/DefaultSidebar";
export { TTDDialog } from "./components/TTDDialog/TTDDialog";
export { TTDDialogTrigger } from "./components/TTDDialog/TTDDialogTrigger";

export {
  getCommonBounds,
  getVisibleSceneBounds,
} from "@excalidraw/element/bounds";
export { zoomToFitBounds } from "./actions/actionCanvas";
export { convertToExcalidrawElements } from "./data/transform";

export {
  elementPartiallyOverlapsWithOrContainsBBox,
  elementsOverlappingBBox,
  isElementInsideBBox,
} from "@excalidraw/utils/withinBounds";

export { isElementLink } from "@excalidraw/element/elementLink";
export { DiagramToCodePlugin } from "./components/DiagramToCodePlugin/DiagramToCodePlugin";
export { getDataURL } from "./data/blob";

export { setCustomTextMetricsProvider } from "@excalidraw/element/textMeasurements";
