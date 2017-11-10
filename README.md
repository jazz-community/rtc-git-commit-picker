# Git Commit Picker
The Git Commit Picker enables you to link Git Commits with RTC Work Items from within the RTC Work Item Editor.

## Goal
The target of this project is to enable RTC users to work with a Git based version control system without breaking the traceability between RTC Work Items and Source Code changes.

## Detailed Information
See the [Wiki pages](https://github.com/jazz-community/rtc-git-commit-picker/wiki) of this repository for more detailed information on how to setup and use the Git Commit Picker.

## Compatibility
This plugin has been tested with multiple versions of RTC and is known to be compatible with v6.0.3, v6.0.4, and v6.0.5

Currently, the only supported Git system is GitLab. The plugin uses the fourth version of the GitLab api (API v4) which was released with GitLab 9.0. Older versions of GitLab will not work at the moment but may be supported soon.

If you have tested the plugin with other versions of RTC or GitLab please let us know so that we can update this page.

## Dependencies
This plugin requires the [Secure User Property Store](https://github.com/jazz-community/rtc-secure-user-property-store) extension to be installed on the RTC server.  
More information and instructions can be found in the description on that repository page.

## Releases
The latest stable release can be downloaded from the [Releases page](https://github.com/jazz-community/rtc-git-commit-picker/releases).

## Contributing
Please use the [Issue Tracker](https://github.com/jazz-community/rtc-git-commit-picker/issues) of this repository to report issues or suggest enhancements.  
Pull requests are also very welcome.

## Licensing
Copyright (c) Siemens AG. All rights reserved.  
Licensed under the [MIT](https://github.com/jazz-community/rtc-git-commit-picker/blob/master/LICENSE) License.