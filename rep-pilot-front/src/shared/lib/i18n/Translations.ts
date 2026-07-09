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
          password: string;
          isAdmin: string;
          language: string;
        };
        placeholders: {
          name: string;
          username: string;
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
      };
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
  };
}

export const translations: Record<Language, Translations> = {
  [Language.En]: en,
  [Language.Es]: es,
};
