import { Language } from "../language/Language";
import { en } from "./locales/en";
import { es } from "./locales/es";

export interface Translations {
  common: {
    search: { placeholder: string };
    loading: string;
  };
  toast: {
    labels: {
      success: string;
      error: string;
      warning: string;
      info: string;
    };
    closeAriaLabel: string;
    containerAriaLabel: string;
  };
  auth: {
    login: {
      subtitle: string;
      usernameLabel: string;
      usernamePlaceholder: string;
      passwordLabel: string;
      passwordPlaceholder: string;
      submit: string;
      submitting: string;
      usernameRequired: string;
      passwordRequired: string;
      ariaLabel: string;
      formAriaLabel: string;
    };
    toast: {
      welcome: (name: string) => string;
      invalidCredentials: string;
      serverError: string;
      loggedOut: string;
      languageSaveError: string;
      sessionExpired: string;
      invalidTwoFactorCode: string;
    };
    twoFactor: {
      title: string;
      description: string;
      codeLabel: string;
      codePlaceholder: string;
      codeRequired: string;
      codeInvalid: string;
      submitButton: string;
      submitting: string;
      backButton: string;
    };
    forcedSetup: {
      title: string;
      subtitle: string;
      logoutButton: string;
    };
  };
  nav: {
    dashboard: string;
    catalogo: string;
    iaKit: string;
    projects: string;
    projectsDetail: string;
    documentation: string;
    admin: string;
  };
  topbar: {
    menuAriaLabel: string;
    languageAriaLabel: (lang: string) => string;
    userAriaLabel: string;
    logoutAriaLabel: string;
  };
  sidebar: {
    brandSub: string;
    closeAriaLabel: string;
    navAriaLabel: string;
  };
  dashboard: {
    kpiSection: string;
    activitySection: string;
    kpi: {
      totalResources: string;
      totalResourcesMeta: string;
      agents: string;
      agentsMeta: string;
      skills: string;
      skillsMeta: string;
      mcpServers: string;
      mcpServersMeta: string;
    };
    featured: {
      heading: string;
      browseCatalog: string;
      empty: string;
    };
    recent: {
      heading: string;
      empty: string;
    };
  };
  admin: {
    tabs: {
      config: string;
      users: string;
    };
    tabsAriaLabel: string;
    gitInstances: {
      title: string;
      subtitle: string;
      addButton: string;
      saveButton: string;
      saving: string;
      emptyTitle: string;
      emptyDescription: string;
      instanceLabel: (n: number) => string;
      fields: {
        url: string;
        username: string;
        token: string;
      };
      placeholders: {
        url: string;
        username: string;
        token: string;
      };
      removeAriaLabel: string;
      loadingAriaLabel: string;
      saveSuccess: string;
      saveError: string;
      loadError: string;
    };
    openaiConfig: {
      title: string;
      subtitle: string;
      fields: { url: string; token: string; model: string };
      placeholders: { url: string; token: string; model: string };
      saveButton: string;
      saving: string;
      saveSuccess: string;
      saveError: string;
    };
    ldapConfig: {
      title: string;
      subtitle: string;
      fields: { url: string; bindDn: string };
      placeholders: { url: string; bindDn: string };
      descriptions: { url: string; bindDn: string };
      bindDnHelpText: string;
      saveButton: string;
      saving: string;
      required: string;
      saveSuccess: string;
      saveError: string;
    };
    twoFactorConfig: {
      title: string;
      subtitle: string;
      label: string;
      description: string;
      saveButton: string;
      saving: string;
      saveSuccess: string;
      saveError: string;
    };
    users: {
      title: string;
      subtitle: string;
      addButton: string;
      table: {
        name: string;
        username: string;
        email: string;
        language: string;
        role: string;
        actions: string;
      };
      adminBadge: string;
      userBadge: string;
      editButton: string;
      emptyTitle: string;
      emptyDescription: string;
      loadError: string;
      loadingAriaLabel: string;
      modal: {
        createTitle: string;
        editTitle: string;
        fields: {
          name: string;
          username: string;
          email: string;
          password: string;
          isAdmin: string;
          language: string;
        };
        placeholders: {
          name: string;
          username: string;
          email: string;
          password: string;
          passwordEdit: string;
        };
        saveButton: string;
        saving: string;
        cancelButton: string;
        createSuccess: string;
        createError: string;
        updateSuccess: string;
        updateError: string;
        required: string;
      };
    };
    forbidden: {
      title: string;
      description: string;
    };
  };
  app: {
    emptyState: {
      description: string;
      action: string;
    };
  };
  resourceDetail: {
    pageTitle: string;
    backButton: string;
    createdAt: string;
    createdBy: string;
    provider: string;
    openRepo: string;
    download: string;
    downloading: string;
    localFiles: string;
    gitRepo: string;
    noDoc: string;
    star: string;
    unstar: string;
    errorNotFound: string;
    errorUnauthorized: string;
    errorServer: string;
    documentationAriaLabel: string;
    edit: string;
    delete: string;
    deleteConfirm: string;
    deleteModal: {
      title: string;
      confirmButton: string;
      confirming: string;
    };
    editSuccess: string;
    deleteSuccess: string;
    editModal: {
      saveButton: string;
      saving: string;
      cancel: string;
      nameLabel: string;
      namePlaceholder: string;
      nameRequired: string;
      descriptionLabel: string;
      descriptionPlaceholder: string;
      tagsLabel: string;
      tagsPlaceholder: string;
      forbidden: string;
      removeTagAriaLabel: (name: string) => string;
      addTagAriaLabel: string;
      addTagButton: string;
      noTagsFound: string;
      newTagPlaceholder: string;
      createTagButton: string;
    };
  };
  profile: {
    pageTitle: string;
    username: string;
    email: string;
    role: string;
    roleAdmin: string;
    roleUser: string;
    language: string;
    adminBadge: string;
    starredTitle: string;
    starredEmpty: string;
    starredError: string;
    security: {
      title: string;
      twoFactorLabel: string;
      twoFactorEnabled: string;
      twoFactorDisabled: string;
      enableButton: string;
      disableButton: string;
      enabling: string;
      setupModal: {
        title: string;
        step: (current: number, total: number) => string;
        step1Title: string;
        step1Desc: string;
        continueButton: string;
        step2Title: string;
        step2Desc: string;
        codeLabel: string;
        codePlaceholder: string;
        codeRequired: string;
        codeInvalid: string;
        confirmButton: string;
        confirming: string;
        cancelButton: string;
        backButton: string;
        invalidCode: string;
        loadError: string;
        successMessage: string;
      };
      disableModal: {
        title: string;
        description: string;
        codeLabel: string;
        codePlaceholder: string;
        codeRequired: string;
        codeInvalid: string;
        confirmButton: string;
        confirming: string;
        cancelButton: string;
        invalidCode: string;
        loadError: string;
        successMessage: string;
      };
    };
    tokens: {
      title: string;
      description: string;
      oneTimeWarning: string;
      copyButton: string;
      copied: string;
      copyError: string;
      dismiss: string;
      namePlaceholder: string;
      createButton: string;
      creating: string;
      loading: string;
      loadError: string;
      empty: string;
      lastUsed: string;
      created: string;
      neverUsed: string;
      revoke: string;
    };
  };
  catalog: {
    searchPlaceholder: string;
    filterAll: string;
    tagDropdownLabel: string;
    tagSearchPlaceholder: string;
    noResults: string;
    noResultsDescription: string;
    errorTitle: string;
    errorDescription: string;
    prevPage: string;
    nextPage: string;
    pageInfo: (page: number, totalPages: number, total: number) => string;
    clearSearchAriaLabel: string;
    filterByTypeAriaLabel: string;
    tagClearFilterAriaLabel: string;
    tagClearSearchAriaLabel: string;
    tagLoading: string;
    tagNoResults: string;
    addResource: {
      buttonLabel: string;
      modalTitle: string;
      step: (current: number, total: number) => string;
      step0: {
        modalTitle: string;
        heading: string;
        git: { title: string; description: string };
        upload: { title: string; description: string };
      };
      step1: {
        heading: string;
        description: string;
        urlLabel: string;
        urlPlaceholder: string;
        urlRequired: string;
        urlInvalid: string;
        scanButton: string;
        scanning: string;
        cancelButton: string;
        successMessage: string;
        errorMessage: string;
      };
      step2: {
        heading: string;
        individual: { title: string; description: string };
        agent: { title: string; description: string };
        kit: { title: string; description: string };
        mcp: { title: string; description: string };
      };
      step3: {
        heading: string;
        resourcesCount: (n: number) => string;
        backButton: string;
        submitButton: string;
        submitting: string;
        successMessage: (n: number) => string;
        errorMessage: string;
        validationError: string;
        editButton: string;
        saveButton: string;
        cancelEditButton: string;
        nameLabel: string;
        namePlaceholder: string;
        nameRequired: string;
        descriptionLabel: string;
        descriptionPlaceholder: string;
        descriptionRequired: string;
        tagsLabel: string;
        tagSearchPlaceholder: string;
        newTagPlaceholder: string;
        addTagButton: string;
        noTagsFound: string;
        tagsRequired: string;
        includeLabel: string;
        removeTagAriaLabel?: string;
        addTagAriaLabel?: string;
      };
      stepUpload: {
        modalTitle: string;
        typeLabel: string;
        pathLabel: string;
        pathPlaceholder: string;
        filesLabel: string;
        filesRequired: string;
        dropzoneAriaLabel: string;
        dropzoneText: string;
        dropzoneHint: string;
        removeFileAriaLabel: string;
        nameRequired: string;
        descriptionRequired: string;
        submitButton: string;
        submitting: string;
        cancelButton: string;
        successMessage: string;
        errorMessage: string;
      };
    };
  };
  projects: {
    title: string;
    subtitle: string;
    createButton: string;
    emptyTitle: string;
    emptyDescription: string;
    createSuccess: string;
    createError: string;
    loadError: string;
    errorTitle: string;
    errorDescription: string;
    gridAriaLabel: string;
    ungroupedLabel: string;
    card: {
      membersCount: (n: number) => string;
      createdBy: string;
    };
    detail: {
      backButton: string;
      loading: string;
      notFound: string;
      detailNotFound: string;
      createdBy: string;
      membersTitle: string;
      filesTitle: string;
      filterAll: string;
      filterByTypeAria: string;
      noFilesFound: string;
      prevPage: string;
      nextPage: string;
      pageInfo: (page: number, totalPages: number, total: number) => string;
      paginationAria: string;
      fileViewer: {
        closeAriaLabel: string;
        loading: string;
        loadError: string;
        openFileAria: string;
      };
      directoryTreeTitle: string;
      downloadConf: string;
      downloadConfTooltip: string;
      editButton: string;
      deleteButton: string;
      editSuccess: string;
      editError: string;
      deleteSuccess: string;
      deleteError: string;
      editModal: {
        title: string;
        closeAriaLabel: string;
        nameLabel: string;
        namePlaceholder: string;
        nameRequired: string;
        membersLabel: string;
        membersSearchPlaceholder: string;
        membersSearchAria: string;
        selectedMembersAria: string;
        removeMemberAria: (name: string) => string;
        membersRequired: string;
        loadingUsers: string;
        noUsersFound: string;
        currentFilesLabel: string;
        noFiles: string;
        removeFileAria: (name: string) => string;
        addFilesLabel: string;
        dropZoneAria: string;
        dropZonePlaceholder: string;
        dropZoneHint: string;
        dropFolderRequired: string;
        dropNoTextFiles: string;
        dropNoRequiredFiles: string;
        groupLabel: string;
        groupPlaceholder: string;
        groupCreateLabel: string;
        groupLoadingText: string;
        groupNoResultsText: string;
        saveButton: string;
        saving: string;
        cancelButton: string;
      };
      deleteModal: {
        title: string;
        message: (name: string) => string;
        confirmButton: string;
        confirming: string;
        cancelButton: string;
      };
    };
    modal: {
      title: string;
      closeAriaLabel: string;
      nameLabel: string;
      namePlaceholder: string;
      nameRequired: string;
      rootFolderLabel: string;
      rootFolderPlaceholder: string;
      rootFolderRequired: string;
      membersLabel: string;
      membersSearchPlaceholder: string;
      membersSearchAria: string;
      selectedMembersAria: string;
      removeMemberAria: (name: string) => string;
      membersRequired: string;
      loadingUsers: string;
      noUsersFound: string;
      dropZoneLabel: string;
      dropZoneAria: string;
      dropZonePlaceholder: string;
      dropZoneHint: string;
      dropFolderRequired: string;
      dropNoTextFiles: string;
      dropNoRequiredFiles: string;
      filesDetected: (count: number) => string;
      andMore: (count: number) => string;
      clearFiles: string;
      submitButton: string;
      creating: string;
      cancelButton: string;
      groupLabel: string;
      groupPlaceholder: string;
      groupCreateLabel: string;
      groupLoadingText: string;
      groupNoResultsText: string;
    };
  };
  iaKit: {
    pageTitle: string;
    initialPrompt: string;
    specsLabel: string;
    specsPlaceholder: string;
    sendButton: string;
    sendLabel: string;
    sendAnswerLabel: string;
    answerLabel: string;
    answerPlaceholder: string;
    analyzing: string;
    error: string;
    chatLabel: string;
    questionLabel: string;
    allAnswered: string;
    summaryTitle: string;
    generatingKit: string;
    kitCreated: string;
    downloadKit: string;
    generationError: string;
    createProjectButton: string;
    createProjectModal: {
      title: string;
      closeAriaLabel: string;
      nameLabel: string;
      namePlaceholder: string;
      nameRequired: string;
      rootFolderLabel: string;
      rootFolderPlaceholder: string;
      rootFolderDetected: string;
      membersLabel: string;
      membersSearchPlaceholder: string;
      membersSearchAria: string;
      selectedMembersAria: string;
      removeMemberAria: (name: string) => string;
      membersRequired: string;
      loadingUsers: string;
      noUsersFound: string;
      submitButton: string;
      creating: string;
      cancelButton: string;
      createSuccess: string;
      createError: string;
      groupLabel: string;
      groupPlaceholder: string;
      groupCreateLabel: string;
      groupLoadingText: string;
      groupNoResultsText: string;
    };
  };
}

export const translations: Record<Language, Translations> = {
  [Language.En]: en,
  [Language.Es]: es,
};
