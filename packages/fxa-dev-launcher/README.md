# Firefox Accounts Custom Profiles for Firefox

> Launch the Firefox browser with a custom profile for various development and testing purposes.

**Refer to the [main README](https://github.com/mozilla/fxa/blob/master/README.md) to learn about getting set up with FxA.**

##### Table of Contents

- [Custom Profiles](#custom-profiles)
- [Basic Usage Example in OS X](#basic-usage-example-in-os-x)

## Custom Profiles

**Use `npm start` to start Firefox with local server configurations.**

Available options:

| Argument              | Available options                      | Default                                                                 | Description                        |
| --------------------- | -------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------- |
| `FXA_ENV`             | `latest`, `stable`, `stage`, `content` | `local`                                                                 | The profile to launch Firefox with |
| `DISABLE_E10S`        | `true`, `false`                        | `true`                                                                  | Use this flag to turn off E10S     |
| `FXA_DESKTOP_CONTEXT` |                                        | `fx_desktop_v3`                                                         |                                    |
| `FIREFOX_BIN`         |                                        | `/Applications/FirefoxNightly.app/Contents/MacOS/firefox-bin npm start` | Where to launch Firefox from       |

## Basic Usage Example in OS X

- Download Node.js
- install it by following the steps in the `.pkg` installer.
- Open Terminal and Run commands:
- `git clone https://github.com/vladikoff/fxa-dev-launcher.git`
- `cd fxa-dev-launcher`
- `npm install`
- `FXA_ENV=latest npm start`

The above will start a firefox talking to `latest.dev.lcip.org`
