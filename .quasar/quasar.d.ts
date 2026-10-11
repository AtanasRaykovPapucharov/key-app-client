/* oxlint-disable */
/* eslint-disable */
/// <reference types="@quasar/app-vite" />
/// <reference types="@quasar/app-vite/client" />

// https://quasar.dev/quasar-cli-vite/handling-import-meta-env#type-inference

// Automatically generated from raw build.define
declare const __VUE_PROD_DEVTOOLS__: boolean;
declare const __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: boolean;
declare const __VUE_I18N_FULL_INSTALL__: boolean;
declare const __VUE_I18N_LEGACY_API__: boolean;
declare const __VUE_I18N_PROD_DEVTOOLS__: boolean;
declare const __INTLIFY_PROD_DEVTOOLS__: boolean;
declare const __VUE_OPTIONS_API__: boolean;

// Automatically generated from process.env & dotenv files & build.define & build.defineEnv;
// Backend-only are not available in client code, so they are marked as optional
interface ImportMetaEnv {
  readonly QCLI_SERVER_URL: string;
  readonly ALLUSERSPROFILE?: string;
  readonly APPDATA?: string;
  readonly CLASSPATH?: string;
  readonly COLOR?: number;
  readonly CommonProgramFiles?: string;
  readonly CommonProgramW6432?: string;
  readonly COMPUTERNAME?: string;
  readonly COMSPEC?: string;
  readonly EDITOR?: string;
  readonly HOME?: string;
  readonly HOMEDRIVE?: string;
  readonly HOMEPATH?: string;
  readonly INIT_CWD?: string;
  readonly LOCALAPPDATA?: string;
  readonly LOGONSERVER?: string;
  readonly NODE?: string;
  readonly NODE_ENV?: string;
  readonly NODE_EXE?: string;
  readonly NPM_CLI_JS?: string;
  readonly npm_command?: string;
  readonly npm_config_allow_scripts?: string;
  readonly npm_config_cache?: string;
  readonly npm_config_globalconfig?: string;
  readonly npm_config_global_prefix?: string;
  readonly npm_config_init_module?: string;
  readonly npm_config_local_prefix?: string;
  readonly npm_config_node_gyp?: string;
  readonly npm_config_noproxy?: string;
  readonly npm_config_npm_version?: string;
  readonly npm_config_prefix?: string;
  readonly npm_config_userconfig?: string;
  readonly npm_config_user_agent?: string;
  readonly npm_execpath?: string;
  readonly npm_lifecycle_event?: string;
  readonly npm_lifecycle_script?: string;
  readonly npm_node_execpath?: string;
  readonly npm_package_engines_node?: string;
  readonly npm_package_json?: string;
  readonly npm_package_name?: string;
  readonly npm_package_version?: string;
  readonly NPM_PREFIX_JS?: string;
  readonly NPM_PREFIX_NPM_CLI_JS?: string;
  readonly NUMBER_OF_PROCESSORS?: number;
  readonly NVM_HOME?: string;
  readonly NVM_SYMLINK?: string;
  readonly OneDrive?: string;
  readonly OS?: string;
  readonly Path?: string;
  readonly PATHEXT?: string;
  readonly PROCESSOR_ARCHITECTURE?: string;
  readonly PROCESSOR_IDENTIFIER?: string;
  readonly PROCESSOR_LEVEL?: number;
  readonly PROCESSOR_REVISION?: number;
  readonly ProgramData?: string;
  readonly ProgramFiles?: string;
  readonly ProgramW6432?: string;
  readonly PROMPT?: string;
  readonly PSModulePath?: string;
  readonly PUBLIC?: string;
  readonly SESSIONNAME?: string;
  readonly SystemDrive?: string;
  readonly SystemRoot?: string;
  readonly TEMP?: string;
  readonly TMP?: string;
  readonly USERDOMAIN?: string;
  readonly USERDOMAIN_ROAMINGPROFILE?: string;
  readonly USERNAME?: string;
  readonly USERPROFILE?: string;
  readonly windir?: string;
}
