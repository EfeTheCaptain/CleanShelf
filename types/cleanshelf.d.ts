// CleanShelf TypeScript Declarations
// Generated for JSDoc/IDE support - not a full TypeScript rewrite

declare interface Window {
  CleanShelf: CleanShelfNamespace | { aborted: true };
}

interface CleanShelfNamespace {
  constants: CleanShelfConstants;
  state: CleanShelfState;
  ui: CleanShelfUI;
  snippets: CleanShelfSnippetsModule;
  storage: CleanShelfStorageModule;
  options: CleanShelfOptionsModule;
  drafts: CleanShelfDraftsModule;
  clipboard: CleanShelfClipboardModule;
  toast: CleanShelfToastModule;
  i18n: CleanShelfI18nModule;
  exportImport: CleanShelfExportImportModule;
  debug: CleanShelfDebugModule;
  dom: CleanShelfDomModule;
  styles: CleanShelfStylesModule;
  recordError: (where: string, err: unknown) => void;
  createState: () => CleanShelfState;
  aborted?: true;
}

interface CleanShelfConstants {
  HOST_ID: string;
  STORAGE_KEY: string;
  FOLDERS_KEY: string;
  SETTINGS_KEY: string;
  DRAFT_KEY: string;
  UNFILED: string;
  DRAFT_DEBOUNCE_MS: number;
  DEFAULT_SETTINGS: CleanShelfSettings;
}

interface CleanShelfSettings {
  layout: "grid" | "list";
  theme: "dark" | "light" | "dracula" | "nord" | "sepia" | "dark-sepia";
  contrast: "normal" | "high";
  fontSize: "sm" | "md" | "lg";
  draftRate: "fast" | "relaxed";
  language: "en" | "tr";
}

interface CleanShelfState {
  view: "main" | "options";
  settings: CleanShelfSettings;
  drilledFolder: string | null;
  lastError: string | null;
  lastErrorAt: string | null;
  collapsedFolders: Set<string>;
  collapsedSubfolders: Set<string>;
  snippets: CleanShelfSnippet[];
  folders: Set<string>;
  draftTimer: ReturnType<typeof setTimeout> | null;
  editingSnippetId: string | null;
  originalEditData: CleanShelfSnippet | null;
  compactView: boolean;
  sortMode: "newest" | "title" | "manual";
  draggingSnippetId: string | null;
  searchQuery: string;
}

interface CleanShelfSnippet {
  id: string;
  title: string;
  folder: string;
  content: string;
  type?: "subfolder";
  subfolder?: string;
  sortOrder?: number;
  createdAt: number;
  updatedAt?: number;
}

interface CleanShelfUI {
  host: HTMLDivElement;
  shadow: ShadowRoot;
  backdrop: HTMLDivElement;
  card: HTMLDivElement;
  toast: HTMLDivElement;
  mainView: HTMLDivElement;
  listEl: HTMLDivElement;
  leftPanel: HTMLDivElement;
  rightPanel: HTMLDivElement;
  titleInput: HTMLInputElement;
  folderInput: HTMLInputElement;
  folderDatalist: HTMLDataListElement;
  contentInput: HTMLTextAreaElement;
  saveBtn: HTMLButtonElement;
  cancelEditBtn: HTMLButtonElement;
  formLabel: HTMLLabelElement;
  draftIndicator: HTMLSpanElement;
  leftActionBtn: HTMLButtonElement;
  leftSubfolderBtn: HTMLButtonElement;
  btnGear: HTMLButtonElement;
  btnDebug: HTMLButtonElement;
  footer: HTMLDivElement;
  contextMenu: CleanShelfContextMenu;
  options: { view: HTMLDivElement; backBtn: HTMLButtonElement; fileInput: HTMLInputElement } | null;
  debug: CleanShelfDebugUI | null;
  focusPrimary: () => void;
}

interface CleanShelfContextMenu {
  targetType: "snippet" | "folder" | null;
  targetData: CleanShelfSnippet | string | null;
  show: (type: "snippet" | "folder", data: CleanShelfSnippet | string, x: number, y: number) => void;
  hide: () => void;
}

interface CleanShelfDebugUI {
  panel: HTMLDivElement;
  lastErrorEl: HTMLSpanElement;
  runBtn: HTMLButtonElement;
  stepsEl: HTMLUListElement;
}

interface CleanShelfSnippetsModule {
  groupByFolder: (snippets: CleanShelfSnippet[]) => CleanShelfFolderGroup[];
  renderFolderList: (snippets: CleanShelfSnippet[]) => void;
  buildSnippetCard: (snippet: CleanShelfSnippet) => HTMLDivElement;
  renderListView: () => void;
  renderGridView: () => void;
  renderSnippets: () => void;
  load: () => Promise<CleanShelfSnippet[]>;
  handleSave: () => Promise<boolean>;
  startEdit: (snippet: CleanShelfSnippet) => void;
  cancelEdit: () => void;
  deleteSnippet: (id: string) => Promise<void>;
  hasEditChanges: () => boolean;
  startRenameFolder: (oldName: string) => void;
  deleteFolder: (folderName: string) => Promise<void>;
  updateFolderInputState: () => void;
  createNewFolder: () => Promise<void>;
  insertSubfolder: (folderName: string) => Promise<void>;
  updateLeftActionBtn: () => void;
  getUniqueTitle: (baseTitle: string, folder: string, snippets: CleanShelfSnippet[]) => string;
}

interface CleanShelfFolderGroup {
  name: string;
  items: CleanShelfSnippet[];
  subfolders: number;
  snippetCount: number;
}

interface CleanShelfStorageModule {
  getSnippets: () => Promise<CleanShelfSnippet[]>;
  saveSnippets: (list: CleanShelfSnippet[]) => Promise<void>;
  getSettings: () => Promise<CleanShelfSettings>;
  persistSettings: () => Promise<void>;
  getDraft: () => Promise<CleanShelfDraft | null>;
  setDraft: (draft: CleanShelfDraft) => Promise<void>;
  removeDraft: () => Promise<void>;
  getFolders: () => Promise<string[]>;
  saveFolders: (folders: string[]) => Promise<void>;
}

interface CleanShelfDraft {
  title: string;
  folder: string;
  content: string;
  updatedAt: number;
}

interface CleanShelfOptionsModule {
  buildOptionsView: (onBack: () => void) => { view: HTMLDivElement; backBtn: HTMLButtonElement; fileInput: HTMLInputElement };
  syncOptionRadios: () => void;
  applySettingsToDom: () => void;
  setLayout: (layout: "grid" | "list") => void;
  setTheme: (theme: CleanShelfSettings["theme"]) => void;
  setContrast: (contrast: "normal" | "high") => void;
  setFontSize: (size: "sm" | "md" | "lg") => void;
  setDraftRate: (rate: "fast" | "relaxed") => void;
  setLanguage: (lang: "en" | "tr") => void;
}

interface CleanShelfDraftsModule {
  setDraftState: (state: "idle" | "dirty" | "saved" | "error") => void;
  currentDraft: () => CleanShelfDraft;
  isDraftEmpty: (draft: CleanShelfDraft) => boolean;
  persistDraft: () => Promise<void>;
  scheduleDraft: () => void;
  flushDraft: () => void;
  loadDraft: () => Promise<void>;
  clearDraft: () => Promise<void>;
}

interface CleanShelfClipboardModule {
  copyText: (text: string) => Promise<void>;
  copySnippet: (snippet: CleanShelfSnippet) => Promise<void>;
}

interface CleanShelfToastModule {
  showToast: (message: string, variant?: "success" | "error", actionLabel?: string, onAction?: () => void) => void;
}

interface CleanShelfI18nModule {
  t: (key: string, params?: Record<string, string | number>) => string;
  applyTranslations: () => void;
}

interface CleanShelfExportImportModule {
  exportSnippets: () => void;
  importFromFile: (file: File, mode: "replace" | "merge") => void;
}

interface CleanShelfDebugModule {
  buildDebugPanel: () => { panel: HTMLDivElement; lastErrorEl: HTMLSpanElement; runBtn: HTMLButtonElement; stepsEl: HTMLUListElement };
  runChecks: () => Promise<void>;
  checks: Array<{ name: string; fn: () => Promise<unknown> | unknown }>;
}

interface CleanShelfDomModule {
  el: (tag: string, cls?: string, text?: string) => HTMLElement;
  svgEl: (attrs: Record<string, string>, children?: SVGElement[]) => SVGSVGElement;
  makeFolderIcon: () => SVGSVGElement;
  makeGearIcon: () => SVGSVGElement;
  makeDraftIcons: () => { dotIcon: SVGSVGElement; checkIcon: SVGSVGElement; errIcon: SVGSVGElement };
}

interface CleanShelfStylesModule {
  STYLES: string;
  applyStyles: (shadowRoot: ShadowRoot) => void;
}