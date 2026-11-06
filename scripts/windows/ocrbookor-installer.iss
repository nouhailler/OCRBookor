; ==============================================================================
; OCRBookor - Script Inno Setup pour Installateur Windows (.exe)
; Version: 1.4.0 (x64)
; ==============================================================================

#define MyAppName "OCRBookor"
#define MyAppVersion "1.4.0"
#define MyAppPublisher "Patrick Nouhailler"
#define MyAppURL "https://github.com/nouhailler/OCRBookor"
#define MyAppExeName "ocrbookor.cmd"

[Setup]
AppId={{E601C2B0-04D6-4DE4-9A24-F4E5BD45A170}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} v{#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}/releases
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
LicenseFile=..\..\LICENSE
OutputBaseFilename=ocrbookor_{#MyAppVersion}_setup_x64
OutputDir=..\..\releases
Compression=lzma2/ultra64
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64compatible
WizardStyle=modern
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog

[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
; Fichiers de l'application préparés dans le dossier releases\ocrbookor_{#MyAppVersion}_win_x64
Source: "..\..\releases\ocrbookor_{#MyAppVersion}_win_x64\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; Tasks: desktopicon

[Run]
Filename: "{app}\install-dependencies.cmd"; Description: "Installer ou verifier les dependances Python (recommande pour OCR local)"; Flags: postinstall skipifsilent nowait
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: postinstall skipifsilent nowait unchecked
