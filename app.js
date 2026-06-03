(function () {
  const STORAGE_KEY = "subconverter-ui-state-v2";
  const booleanParams = [
    "emoji",
    "udp",
    "sort",
    "scv",
    "list",
    "append_type",
    "fdn",
    "expand",
    "classic",
    "tfo",
    "add_emoji",
    "remove_emoji",
    "append_info",
    "tls13",
    "new_name",
    "insert",
    "prepend",
    "script"
  ];
  const optionalTextParams = ["filename", "interval"];

  const defaults = {
    endpoint: "http://192.168.100.1:25500/sub",
    target: "clash",
    sourceUrl: "",
    configUrl: "https://raw.githubusercontent.com/vanness30214/clash-rule/main/config/metafenliu.ini",
    params: {
      include: "",
      exclude: "",
      emoji: "false",
      list: "false",
      sort: "true",
      udp: "true",
      scv: "true",
      append_type: "true",
      fdn: "true",
      expand: "false",
      classic: "true",
      tfo: "false",
      add_emoji: "false",
      remove_emoji: "false",
      append_info: "false",
      tls13: "false",
      new_name: "false",
      insert: "false",
      prepend: "false",
      script: "false",
      filename: "",
      interval: ""
    },
    extraParams: {}
  };

  const preset = normalizePreset(window.SUBWEB_PERSONAL_PRESET || {});
  let state = loadState();

  const fields = {
    endpoint: document.getElementById("endpoint"),
    target: document.getElementById("target"),
    sourceUrl: document.getElementById("sourceUrl"),
    configUrl: document.getElementById("configUrl"),
    include: document.getElementById("include"),
    exclude: document.getElementById("exclude"),
    filename: document.getElementById("filename"),
    interval: document.getElementById("interval"),
    extraParams: document.getElementById("extraParams"),
    resultUrl: document.getElementById("resultUrl"),
    copyText: document.getElementById("copyText"),
    status: document.getElementById("status"),
    openLink: document.getElementById("openLink")
  };

  document.getElementById("convertBtn").addEventListener("click", updateResult);
  document.getElementById("copyBtn").addEventListener("click", copyResult);
  document.getElementById("resetBtn").addEventListener("click", resetState);

  ["endpoint", "target", "sourceUrl", "configUrl", "include", "exclude", "filename", "interval", "extraParams"].forEach((id) => {
    fields[id].addEventListener("input", handleChange);
    fields[id].addEventListener("change", handleChange);
  });

  booleanParams.forEach((key) => {
    const input = document.querySelector(`[data-param="${key}"]`);
    input.addEventListener("change", handleChange);
  });

  applyStateToForm();
  updateResult();

  function normalizePreset(raw) {
    return {
      ...defaults,
      ...raw,
      params: {
        ...defaults.params,
        ...(raw.params || {}),
        ...flagsToParams(raw.flags || {})
      },
      extraParams: raw.extraParams || {}
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved) {
        return normalizePreset({
          ...preset,
          ...saved,
          params: {
            ...preset.params,
            ...(saved.params || {})
          },
          extraParams: saved.extraParams || {}
        });
      }
    } catch (error) {
      console.warn("Unable to read saved state", error);
    }
    return clone(preset);
  }

  function resetState() {
    state = clone(preset);
    localStorage.removeItem(STORAGE_KEY);
    applyStateToForm();
    updateResult("\u53c2\u6570\u5df2\u6062\u590d\u9ed8\u8ba4\u3002");
  }

  function handleChange() {
    readFormIntoState();
    saveState();
    updateResult();
  }

  function applyStateToForm() {
    fields.endpoint.value = state.endpoint || "";
    fields.target.value = state.target || "clash";
    fields.sourceUrl.value = state.sourceUrl || "";
    fields.configUrl.value = state.configUrl || "";
    fields.include.value = state.params.include || "";
    fields.exclude.value = state.params.exclude || "";
    fields.filename.value = state.params.filename || "";
    fields.interval.value = state.params.interval || "";
    fields.extraParams.value = formatExtraParams(state.extraParams);

    booleanParams.forEach((key) => {
      document.querySelector(`[data-param="${key}"]`).checked = state.params[key] === "true";
    });
  }

  function readFormIntoState() {
    state.endpoint = fields.endpoint.value.trim();
    state.target = fields.target.value;
    state.sourceUrl = fields.sourceUrl.value.trim();
    state.configUrl = fields.configUrl.value.trim();
    state.params.include = fields.include.value.trim();
    state.params.exclude = fields.exclude.value.trim();
    state.params.filename = fields.filename.value.trim();
    state.params.interval = fields.interval.value.trim();
    state.extraParams = parseExtraParams(fields.extraParams.value);

    booleanParams.forEach((key) => {
      state.params[key] = document.querySelector(`[data-param="${key}"]`).checked ? "true" : "false";
    });
  }

  function buildUrl() {
    if (!state.sourceUrl) {
      throw new Error("\u8bf7\u5148\u586b\u5199\u539f\u59cb\u8ba2\u9605\u94fe\u63a5\u3002");
    }

    let url;
    try {
      url = new URL(state.endpoint);
    } catch (error) {
      throw new Error("\u8bf7\u5148\u586b\u5199\u6709\u6548\u7684\u540e\u7aef\u670d\u52a1\u5730\u5740\u3002");
    }

    url.search = "";
    url.searchParams.set("target", state.target);
    url.searchParams.set("url", state.sourceUrl);
    url.searchParams.set("config", state.configUrl);

    Object.entries(state.params).forEach(([key, value]) => {
      if (optionalTextParams.includes(key) && !value) return;
      url.searchParams.set(key, value);
    });

    Object.entries(state.extraParams).forEach(([key, value]) => {
      if (key) url.searchParams.set(key, value);
    });

    return url.toString();
  }

  function updateResult(message) {
    readFormIntoState();

    try {
      const result = buildUrl();
      fields.resultUrl.value = result;
      fields.copyText.value = result;
      fields.openLink.href = result;
      setStatus(message || "\u5df2\u751f\u6210\u8f6c\u6362\u94fe\u63a5\u3002");
    } catch (error) {
      fields.resultUrl.value = "";
      fields.copyText.value = "";
      fields.openLink.href = "#";
      setStatus(error.message, true);
    }
  }

  async function copyResult() {
    if (!fields.resultUrl.value) return;

    try {
      await navigator.clipboard.writeText(fields.resultUrl.value);
    } catch (error) {
      fields.resultUrl.select();
      document.execCommand("copy");
    }
    setStatus("\u5df2\u590d\u5236\u8f6c\u6362\u94fe\u63a5\u3002");
  }

  function parseExtraParams(text) {
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .reduce((params, line) => {
        const index = line.indexOf("=");
        if (index === -1) {
          params[line] = "";
        } else {
          params[line.slice(0, index).trim()] = line.slice(index + 1).trim();
        }
        return params;
      }, {});
  }

  function formatExtraParams(params) {
    return Object.entries(params || {})
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");
  }

  function flagsToParams(flags) {
    return Object.fromEntries(Object.entries(flags).map(([key, value]) => [key, String(Boolean(value))]));
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function setStatus(message, isError = false) {
    fields.status.textContent = message;
    fields.status.classList.toggle("error", isError);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
})();
