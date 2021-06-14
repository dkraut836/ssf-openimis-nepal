# openIMIS Frontend Insuree reference module
This repository holds the files of the openIMIS Frontend Insuree reference module.
It is dedicated to be deployed as a module of [openimis-fe_js](https://github.com/openimis/openimis-fe_js).

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

## Main Menu Contributions
* **Insurees and Policies** (insuree.mainMenu translation key)

  **Add Family/Group** (insuree.menu.addFamilyOrGroup translation key), displayed if user has the right `101002`

  **Families/Group** (insuree.menu.familiesOrGroups translation key), displayed if user has the right `101001`

  **Insurees** (insuree.menu.insureestranslation key), displayed if user has the right `101101`

## Other Contributions
* `core.AppBar`: `[Enquiry]`, registering the enquiry search input (and related dialog) to the AppBar
* `insuree.InsureeSummaryAvatar`: `[InsureeAvatar]`, contributing to own contribution point and register the default Avatar loading component to InsureeSummary
* `insuree.InsureeSummaryExt`: `[InsureeFirstServicePoint]`,contributing to own contribution point and register the default the First Service Point as insuree summary extension
* `core.Router`: registering the `insuree/create`, `insuree/families`, `insuree/insurees`, `insuree/cappedItemService` and `insuree/profile` routes in openIMIS client-side router

## Available Contribution Points
* `insuree.MainMenu`: ability to add entries within the main menu entry (known usage: openimis-fe-policy)
* `insuree.InsureeSummaryAvatar`: ability to add (replace default?) component dedicated to load the insuree avatar (left side of the summary)
* `insuree.InsureeSummaryCore`: ability to add components to the insuree summary primary panel
* `insuree.InsureeSummaryExt`: ability to add (replace default?) component to extend insuree summary (right side)
* `insuree.InsureeSummary`: ability to extend the insuree summary (Grid rows below)


## Published Components
* `insuree.InsureePicker`, ability to search and select an insuree (via searcher dialog)
* `insuree.Avatar`, loading insuree Avatar (from legacy openIMIS, via `/photo/:insuree.photo.folder/:insuree.photo.filename` URL). This component is the default contribution to `insuree.InsureeSummaryAvatar`
* `insuree.Summary`: component displaying an insuree summary (highly extensible via contribution point). Known usage: Enquiry dialog
* `insuree.FirstServicePoint`, Grid container displaying insuree first service point (insuree primary Health Facility, District and Region). This component is the default contribution to `insuree.InsureeSummaryExt`
* `insuree.FamilySummary`, Paper component displaying insuree family information. Can be added to `insuree.InsureeSummary` contribution point (cfr. Nepali 'setup')
* `insuree.ProfileLink`, Link to legacy insuree Profile page. Can be added to `insuree.InsureeSummary` contribution point (cfr. Nepali 'setup')
* `insuree.CappedItemServiceLink`, Link to legacy insuree Capped Items and Services page. Can be added to `insuree.InsureeSummary` contribution point (cfr. Nepali 'setup')

## Dispatched Redux Actions
* `INSUREE_ENQUIRY_{REQ|RESP|ERR}`: fetching insuree main information (Known usage: enquiry dialog)
* `INSUREE_FAMILY_{REQ|RESP|ERR}`: fetching insuree family information (Known usage: `insuree.FamilySummary` component)
* `INSUREE_INSUREES_{REQ|RESP|ERR}`: fetching insurees with filter (CHFID, Name and/or OtherName). Known usage: `insuree.InsureePicker`

## Other Modules Listened Redux Actions
None

## Other Modules Redux State Bindings
* `state.core.user`, to access user info (rights,...)

## Configurations Options
* `debounceTime`: debounce time (in ms) before triggering the search in insuree picker (Default: `800`)
* `insureeForm.chfIdMaxLength`, the max size of an insuree CHF ID, default 9;